"""
Carousel Routes
───────────────
POST /api/carousel/upload-logo     — upload brand logo (Creator/Pro only)
GET  /api/carousel/brand-settings  — get current brand settings
DELETE /api/carousel/logo          — remove uploaded logo
POST /api/carousel/set-theme       — update preferred theme
"""

from flask import Blueprint, request, jsonify, abort, g
from middleware.auth import require_auth
from services.logo_processor import process_logo, get_brand_settings
from db import get_supabase
import os

carousel_bp = Blueprint('carousel', __name__)

# ── Tier guard ─────────────────────────────────────────────────────────

def require_paid(tier: str):
    """Abort 402 if user is on free tier."""
    if tier not in ('creator', 'pro'):
        abort(402, 'Logo upload requires Creator or Pro plan')


# ── Upload logo ────────────────────────────────────────────────────────

@carousel_bp.route('/carousel/upload-logo', methods=['POST'])
@require_auth
def upload_logo():
    """
    Accepts multipart/form-data with 'logo' file field.
    Processes logo, extracts brand color, stores in Supabase.

    Returns brand color data for immediate UI preview.
    """
    require_paid(g.user_tier)

    if 'logo' not in request.files:
        abort(400, 'No logo file in request. Use multipart/form-data with field name "logo".')

    file = request.files['logo']
    if not file.filename:
        abort(400, 'Empty filename')

    # Validate MIME type
    allowed_mimes = {'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'}
    mime_type = file.content_type or 'image/png'
    if mime_type not in allowed_mimes:
        abort(400, f'Unsupported file type: {mime_type}. Use PNG, JPG, WebP, or SVG.')

    file_bytes = file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        abort(400, 'Logo must be under 5MB')

    try:
        brand_data = process_logo(file_bytes, mime_type, g.user_id)
    except ValueError as e:
        abort(400, str(e))
    except Exception as e:
        abort(500, f'Logo processing failed: {str(e)}')

    # Save to user_brand_settings
    sb = get_supabase()
    sb.table('user_brand_settings').upsert({
        'user_id':           g.user_id,
        'logo_path':         brand_data['logo_path'],
        'logo_url':          brand_data['logo_url'],
        'brand_color_hex':   brand_data['brand_color_hex'],
        'brand_color_dark':  brand_data['brand_color_dark'],
        'brand_color_light': brand_data['brand_color_light'],
        'preferred_theme':   'brand',   # auto-switch to brand theme on logo upload
    }, on_conflict='user_id').execute()

    return jsonify({
        'success':           True,
        'logo_url':          brand_data['logo_url'],
        'brand_color_hex':   brand_data['brand_color_hex'],
        'brand_color_dark':  brand_data['brand_color_dark'],
        'brand_color_light': brand_data['brand_color_light'],
        'text_on_brand':     brand_data['text_on_brand'],
        'message':           f'Brand color extracted: {brand_data["brand_color_hex"]}',
    })


# ── Get brand settings ─────────────────────────────────────────────────

@carousel_bp.route('/carousel/brand-settings', methods=['GET'])
@require_auth
def brand_settings():
    """Returns current brand settings for the user."""
    require_paid(g.user_tier)

    settings = get_brand_settings(g.user_id)
    if not settings:
        return jsonify({'has_logo': False, 'preferred_theme': 'dark'})

    return jsonify({
        'has_logo':          bool(settings.get('logo_url')),
        'logo_url':          settings.get('logo_url'),
        'brand_color_hex':   settings.get('brand_color_hex'),
        'brand_color_dark':  settings.get('brand_color_dark'),
        'brand_color_light': settings.get('brand_color_light'),
        'preferred_theme':   settings.get('preferred_theme', 'dark'),
    })


# ── Set theme preference ───────────────────────────────────────────────

@carousel_bp.route('/carousel/set-theme', methods=['POST'])
@require_auth
def set_theme():
    """Updates preferred carousel theme for the user."""
    require_paid(g.user_tier)

    data = request.get_json() or {}
    theme = data.get('theme', 'dark')

    allowed_themes = {'dark', 'gradient', 'minimal', 'bold', 'brand'}
    if theme not in allowed_themes:
        abort(400, f'Invalid theme. Choose from: {", ".join(allowed_themes)}')

    # If 'brand' selected but no logo, reject
    if theme == 'brand':
        settings = get_brand_settings(g.user_id)
        if not settings or not settings.get('logo_url'):
            abort(400, 'Upload a logo first to use the brand theme')

    sb = get_supabase()
    sb.table('user_brand_settings').upsert(
        {'user_id': g.user_id, 'preferred_theme': theme},
        on_conflict='user_id'
    ).execute()

    return jsonify({'success': True, 'theme': theme})


# ── Delete logo ────────────────────────────────────────────────────────

@carousel_bp.route('/carousel/logo', methods=['DELETE'])
@require_auth
def delete_logo():
    """Removes uploaded logo and resets theme to 'dark'."""
    require_paid(g.user_tier)

    settings = get_brand_settings(g.user_id)
    if not settings or not settings.get('logo_path'):
        return jsonify({'success': True, 'message': 'No logo to delete'})

    # Delete from Supabase Storage
    sb = get_supabase()
    try:
        sb.storage.from_('user-logos').remove([settings['logo_path']])
    except Exception:
        pass  # Non-fatal if file already gone

    # Update DB — clear logo fields, reset theme
    sb.table('user_brand_settings').update({
        'logo_path':        None,
        'logo_url':         None,
        'brand_color_hex':  None,
        'brand_color_dark': None,
        'brand_color_light': None,
        'preferred_theme':  'dark',
    }).eq('user_id', g.user_id).execute()

    return jsonify({'success': True})
