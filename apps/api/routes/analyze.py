from flask import Blueprint, jsonify, request, g, abort
from app import limiter
from services.transcript import get_transcript
from services.video_metadata import get_video_metadata
from services.ai import analyze_video
from services.content_processor import apply_tier_gates
from middleware.auth import require_auth
from services.usage import check_usage_limit, increment_usage
from db import get_supabase
import requests, re, os

analyze_bp = Blueprint('analyze', __name__)
YT_REGEX = re.compile(
    r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/|youtube\.com/live/)([A-Za-z0-9_-]{11})'
)

def analyze_rate_limit():
    if hasattr(g, 'user_id') and g.user_id:
        return "60 per hour"
    return "5 per hour"

@analyze_bp.route('/analyze', methods=['POST'])
@require_auth
@limiter.limit(analyze_rate_limit)
def analyze():
    data = request.get_json() or {}
    video_url = data.get('video_url', '').strip()

    # Validate YouTube URL
    match = YT_REGEX.search(video_url)
    if not match:
        abort(400, 'Invalid YouTube URL. Paste a youtube.com or youtu.be link.')
    video_id = match.group(1)

    # Check usage limit (but don't increment yet)
    check_usage_limit(g.user_id, g.user_tier)

    # Fetch metadata and enforce duration limits based on tier
    try:
        metadata = get_video_metadata(video_id)
        duration_sec = metadata.get('duration_seconds', 0)
        
        tier = g.user_tier
        if tier == 'free' and duration_sec > 15 * 60:
            abort(400, f'Free plan is limited to 15-minute videos. This video is {int(duration_sec/60)} mins. Upgrade to Creator to unlock up to 3 hours.')
        elif tier == 'creator' and duration_sec > 3 * 3600:
            abort(400, f'Creator plan is limited to 3-hour videos. This video is {duration_sec/3600:.1f} hours. Upgrade to Pro to unlock up to 6 hours.')
        elif tier == 'pro' and duration_sec > 6 * 3600:
            abort(400, f'Pro plan is limited to 6-hour videos. This video is {duration_sec/3600:.1f} hours.')
    except Exception as e:
        if hasattr(e, 'code') and e.code == 400:
            raise e
        # If metadata fetching fails for some other reason, we'll let it proceed and the background job will handle/log the failure

    # Insert analysis row with 'queued' status
    sb = get_supabase()
    result = sb.table('analyses').insert({
        'user_id':   g.user_id,
        'video_id':  video_id,
        'video_url': video_url,
        'status':    'queued',
    }).execute()
    analysis_id = result.data[0]['id']

    # Dispatch Trigger.dev job via Next.js API route
    trigger_resp = requests.post(
        f"{os.environ['APP_URL']}/api/trigger/analyze",
        json={
            'analysisId': analysis_id,
            'videoId':    video_id,
            'videoUrl':   video_url,
            'userId':     g.user_id,
            'userTier':   g.user_tier,
        },
        headers={'X-Internal-Secret': os.environ['INTERNAL_SECRET']},
        timeout=30
    )

    if not trigger_resp.ok:
        # Update status to failed if Trigger.dev dispatch fails
        sb.table('analyses').update({'status': 'failed', 'error_message': 'Job dispatch failed'}).eq('id', analysis_id).execute()
        abort(500, 'Failed to queue analysis job')

    trigger_run_id = trigger_resp.json().get('runId')
    sb.table('analyses').update({'trigger_job_id': trigger_run_id}).eq('id', analysis_id).execute()

    return jsonify({'analysis_id': analysis_id, 'status': 'queued'})

@analyze_bp.route('/analysis/<analysis_id>', methods=['GET'])
@require_auth
@limiter.limit("3000 per hour")
def get_analysis(analysis_id):
    sb = get_supabase()
    result = sb.table('analyses') \
        .select('*') \
        .eq('id', analysis_id) \
        .eq('user_id', g.user_id) \
        .execute()
    if not result.data:
        abort(404, 'Analysis not found')
    return jsonify(result.data[0])

@analyze_bp.route('/internal/process', methods=['POST'])
def internal_process():
    # Validate internal secret
    if request.headers.get('X-Internal-Secret') != os.environ.get('INTERNAL_SECRET'):
        abort(401)
    data = request.get_json()
    video_id   = data['videoId']
    user_tier  = data['userTier']
    user_id    = data['userId']

    # Fetch metadata first to know the duration
    metadata = get_video_metadata(video_id)
    duration_sec = metadata.get('duration_seconds', 0)

    # Get transcript (passing duration for FUP check)
    transcript_data = get_transcript(video_id, duration_sec)

    # Run AI
    result = analyze_video(transcript_data, metadata, user_tier)
    result = apply_tier_gates(result, user_tier)

    result['transcript_source'] = transcript_data['source']

    # Add metadata so Trigger.dev can save it
    result['video_title'] = metadata.get('title')
    result['video_channel'] = metadata.get('channel')
    result['video_thumbnail'] = metadata.get('thumbnail')
    result['video_duration_seconds'] = metadata.get('duration_seconds')

    # Only increment usage since the AI generation succeeded!
    increment_usage(user_id)    
    return jsonify(result)

