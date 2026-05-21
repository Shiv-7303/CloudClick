from flask import Blueprint, jsonify, request, g, abort
from db import get_supabase
from middleware.auth import require_auth

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
@require_auth
def get_history():
    page  = int(request.args.get('page', 1))
    limit = min(int(request.args.get('limit', 20)), 50)  # max 50 per page
    offset = (page - 1) * limit

    sb = get_supabase()
    result = sb.table('analyses') \
        .select('id, video_id, video_title, video_channel, video_thumbnail, video_duration_seconds, status, model_used, created_at, completed_at') \
        .eq('user_id', g.user_id) \
        .neq('status', 'queued') \
        .order('created_at', desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    count_result = sb.table('analyses') \
        .select('id', count='exact') \
        .eq('user_id', g.user_id) \
        .execute()

    # Supabase python client returns count in a slightly different format
    total_count = count_result.count if hasattr(count_result, 'count') else 0

    return jsonify({
        'analyses': result.data,
        'total': total_count,
        'page': page,
        'limit': limit,
        'has_more': (offset + limit) < total_count
    })

@history_bp.route('/history/<analysis_id>', methods=['DELETE'])
@require_auth
def delete_analysis(analysis_id):
    sb = get_supabase()
    # Soft delete: set status to hidden or hard delete
    sb.table('analyses').delete() \
        .eq('id', analysis_id) \
        .eq('user_id', g.user_id) \
        .execute()
    return jsonify({'deleted': True})

@history_bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    sb = get_supabase()
    result = sb.table('users') \
        .select('id, email, name, tier, analyses_used_this_month, analyses_used_lifetime, last_reset_date') \
        .eq('id', g.user_id) \
        .execute()
        
    if not result.data:
        abort(401, 'User not found. Please sign out and sign in again.')
        
    user = result.data[0]
    
    # Calculate limits based on tier
    TIER_LIMITS = {
        'free': 1,       # Lifetime
        'creator': 20,   # Monthly
        'pro': 40        # Monthly
    }
    
    tier = user.get('tier', 'free')
    limit = TIER_LIMITS.get(tier, 1)
    
    if tier == 'free':
        used = user.get('analyses_used_lifetime', 0)
        reset_type = 'lifetime'
    else:
        used = user.get('analyses_used_this_month', 0)
        reset_type = 'monthly'
        
    remaining = max(0, limit - used)
    
    return jsonify({
        'user': user,
        'usage': {
            'tier': tier,
            'limit': limit,
            'used': used,
            'remaining': remaining,
            'reset_type': reset_type
        }
    })

