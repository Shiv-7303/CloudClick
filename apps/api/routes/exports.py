import os
import io
import json
import zipfile
import asyncio
from flask import Blueprint, request, jsonify, abort, g
from db import get_supabase
from middleware.auth import require_auth
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from services.carousel_renderer import render_carousel, render_carousel_pdf
from services.logo_processor import get_brand_settings

exports_bp = Blueprint('exports', __name__)

def generate_pdf_legacy(analysis_data, tier, settings=None):
    """Generates PDF using reportlab. Legacy method."""
    pass # Replaced by Playwright implementation

def generate_markdown(analysis_data):
    """Generates markdown export."""
    md_content = f"# {analysis_data.get('video_title', 'Analysis Export')}\n\n"
    md_content += f"**Summary**: {analysis_data.get('summary', '')}\n\n"
    
    if analysis_data.get('linkedin_post_v1'):
        md_content += "## LinkedIn Posts\n\n### V1\n" + analysis_data['linkedin_post_v1'] + "\n\n"
    if analysis_data.get('linkedin_post_v2'):
        md_content += "### V2\n" + analysis_data['linkedin_post_v2'] + "\n\n"
    if analysis_data.get('linkedin_post_v3'):
        md_content += "### V3\n" + analysis_data['linkedin_post_v3'] + "\n\n"
        
    thread = analysis_data.get('twitter_thread', [])
    if thread:
        md_content += "## Twitter Thread\n\n"
        for t in thread:
            md_content += f"{t.get('position', 1)}. {t.get('text', '')}\n\n"
            
    return md_content.encode('utf-8')

def generate_carousel_pngs(analysis: dict, user_id: str, user_tier: str) -> bytes:
    """
    Generates all carousel slides as PNGs, returns ZIP bytes.
    Called when user clicks Export PNG.
    """
    # Get user's preferred theme
    brand_settings = get_brand_settings(user_id) if user_tier != 'free' else None
    theme_name = brand_settings.get('preferred_theme', 'dark') if brand_settings else 'dark'

    # Get carousel slides from analysis
    slides = analysis.get('carousel_slides') or analysis.get('carousel_preview') or []
    if not slides:
        raise ValueError("No carousel slides in this analysis")

    # Render all slides
    png_list = render_carousel(
        carousel_slides=slides,
        user_id=user_id,
        user_tier=user_tier,
        theme_name=theme_name,
        video_title=analysis.get('video_title', ''),
    )

    # Bundle as ZIP
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for i, png_bytes in enumerate(png_list, start=1):
            zf.writestr(f'slide_{i:02d}.png', png_bytes)

    return zip_buffer.getvalue()

@exports_bp.route('/exports', methods=['POST'])
@require_auth
def create_export():
    data = request.get_json() or {}
    analysis_id = data.get('analysis_id')
    format_type = data.get('format')
    
    if not analysis_id or not format_type:
        abort(400, "analysis_id and format are required")
        
    # Tier access matrix
    tier = g.user_tier
    if tier == 'free':
        from app import PaymentRequired
        raise PaymentRequired("Exports are not available on the free plan.")
        
    valid_formats = []
    if tier == 'creator':
        valid_formats = ['pdf', 'png']
    elif tier == 'pro':
        valid_formats = ['pdf', 'png', 'markdown', 'json']
        
    if format_type not in valid_formats:
        from app import PaymentRequired
        raise PaymentRequired(f"Format '{format_type}' is not available on your {tier} plan.")
        
    sb = get_supabase()
    
    # Get analysis data
    analysis_res = sb.table('analyses').select('*').eq('id', analysis_id).eq('user_id', g.user_id).execute()
    if not analysis_res.data:
        abort(404, "Analysis not found")
    analysis_data = analysis_res.data[0]
    
    # Get user settings
    settings_res = sb.table('user_brand_settings').select('*').eq('user_id', g.user_id).execute()
    settings = settings_res.data[0] if settings_res.data else {'theme': 'dark'}
    
    # Create export job record
    job_res = sb.table('export_jobs').insert({
        'user_id': g.user_id,
        'analysis_id': analysis_id,
        'format': format_type,
        'status': 'processing'
    }).execute()
    job_id = job_res.data[0]['id']
    
    try:
        # Generate content
        content_bytes = None
        content_type = ''
        file_extension = format_type
        
        slides = analysis_data.get('carousel_slides') or analysis_data.get('carousel_preview') or []
        
        if format_type == 'pdf':
            brand_settings = get_brand_settings(g.user_id) if tier != 'free' else None
            theme_name = brand_settings.get('preferred_theme', 'dark') if brand_settings else 'dark'
            content_bytes = render_carousel_pdf(
                carousel_slides=slides,
                user_id=g.user_id,
                user_tier=tier,
                theme_name=theme_name,
                video_title=analysis_data.get('video_title', '')
            )
            content_type = 'application/pdf'
        elif format_type == 'png':
            content_bytes = generate_carousel_pngs(analysis_data, g.user_id, tier)
            content_type = 'application/zip'
            file_extension = 'zip'
        elif format_type == 'markdown':
            content_bytes = generate_markdown(analysis_data)
            content_type = 'text/markdown'
        elif format_type == 'json':
            content_bytes = json.dumps(analysis_data, indent=2).encode('utf-8')
            content_type = 'application/json'
            
        # Upload to Supabase Storage
        storage_path = f"{g.user_id}/{analysis_id}/export_{job_id}.{file_extension}"
        sb.storage.from_("exports").upload(
            storage_path,
            content_bytes,
            {"content-type": content_type}
        )
        
        # Generate signed URL
        signed = sb.storage.from_('exports').create_signed_url(storage_path, 3600)
        download_url = signed['signedURL']
        
        # Update job
        sb.table('export_jobs').update({
            'status': 'complete',
            'storage_path': storage_path,
            'download_url': download_url,
            'completed_at': 'NOW()'
        }).eq('id', job_id).execute()
        
    except Exception as e:
        sb.table('export_jobs').update({
            'status': 'failed',
            'error': str(e)
        }).eq('id', job_id).execute()
        abort(500, f"Failed to generate export: {str(e)}")
        
    return jsonify({
        'job_id': job_id,
        'status': 'complete',
        'download_url': download_url
    })

@exports_bp.route('/exports/<job_id>', methods=['GET'])
@require_auth
def get_export_job(job_id):
    sb = get_supabase()
    result = sb.table('export_jobs').select('*').eq('id', job_id).eq('user_id', g.user_id).execute()
    if not result.data:
        abort(404, "Export job not found")
        
    return jsonify(result.data[0])
