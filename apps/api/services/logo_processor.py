"""
Logo Processor Service
─────────────────────
Handles:
1. Receiving logo upload (PNG/JPG/SVG/WEBP)
2. Resizing and normalizing
3. Extracting dominant brand color using ColorThief
4. Generating dark/light variants of the brand color
5. Uploading to Supabase Storage
6. Returning brand color data

Cost: zero external API calls. Pure Python image processing.
"""

import os
import io
import colorsys
from PIL import Image
from colorthief import ColorThief
from db import get_supabase


# ── Color utilities ────────────────────────────────────────────────────

def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """'#E63946' → (230, 57, 70)"""
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """(230, 57, 70) → '#e63946'"""
    return f'#{r:02x}{g:02x}{b:02x}'


def darken_color(hex_color: str, factor: float = 0.4) -> str:
    """
    Darken a hex color by reducing HSL lightness.
    factor=0.4 → 40% of original lightness
    Used for slide backgrounds.
    """
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    l_new = max(0.05, l * factor)
    r2, g2, b2 = colorsys.hls_to_rgb(h, l_new, s)
    return rgb_to_hex(int(r2 * 255), int(g2 * 255), int(b2 * 255))


def lighten_color(hex_color: str, factor: float = 1.6) -> str:
    """
    Lighten a hex color.
    factor=1.6 → 160% lightness (capped at white)
    Used for accent text on dark backgrounds.
    """
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    l_new = min(0.92, l * factor)
    r2, g2, b2 = colorsys.hls_to_rgb(h, l_new, s)
    return rgb_to_hex(int(r2 * 255), int(g2 * 255), int(b2 * 255))


def get_luminance(hex_color: str) -> float:
    """
    Returns relative luminance (0=black, 1=white).
    Used to decide if text on brand-color bg should be white or dark.
    """
    r, g, b = [x / 255.0 for x in hex_to_rgb(hex_color)]
    r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
    g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
    b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def text_on_color(hex_background: str) -> str:
    """Returns '#FFFFFF' or '#0A0A0A' depending on background luminance."""
    return '#FFFFFF' if get_luminance(hex_background) < 0.35 else '#0A0A0A'


# ── Logo processing ────────────────────────────────────────────────────

def process_logo(
    file_bytes: bytes,
    mime_type: str,
    user_id: str
) -> dict:
    """
    Main entry point.
    
    Args:
        file_bytes:  Raw bytes of uploaded file
        mime_type:   'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml'
        user_id:     UUID of the uploading user
    
    Returns:
        {
            logo_path:         str  — path in Supabase Storage
            logo_url:          str  — signed URL (24h)
            brand_color_hex:   str  — dominant color '#RRGGBB'
            brand_color_dark:  str  — darkened for backgrounds
            brand_color_light: str  — lightened for accents
            text_on_brand:     str  — '#FFFFFF' or '#0A0A0A'
        }
    
    Raises:
        ValueError if file is not a valid image
        ValueError if file > 5MB
    """
    if len(file_bytes) > 5 * 1024 * 1024:
        raise ValueError("Logo must be under 5MB")

    if mime_type == 'image/svg+xml':
        # SVG: use default accent color, skip color extraction
        # (ColorThief needs raster image)
        brand_color = '#F5A623'  # CloudClick amber as fallback
    else:
        # Extract dominant color using ColorThief
        brand_color = _extract_dominant_color(file_bytes)

    # Normalize logo image (resize, remove alpha for consistency)
    normalized_bytes, normalized_mime = _normalize_logo(file_bytes, mime_type)

    # Upload to Supabase Storage
    storage_path = f"{user_id}/logo.png"
    logo_url = _upload_to_supabase(normalized_bytes, storage_path)

    # Generate color variants
    dark_bg    = darken_color(brand_color, factor=0.25)
    light_acc  = lighten_color(brand_color, factor=1.7)
    text_color = text_on_color(brand_color)

    return {
        'logo_path':          storage_path,
        'logo_url':           logo_url,
        'brand_color_hex':    brand_color,
        'brand_color_dark':   dark_bg,
        'brand_color_light':  light_acc,
        'text_on_brand':      text_color,
    }


def _extract_dominant_color(file_bytes: bytes) -> str:
    """Extract most dominant non-white, non-black color from image."""
    img_io = io.BytesIO(file_bytes)

    # ColorThief needs a file-like object
    ct = ColorThief(img_io)

    # Get palette of 8 colors, pick most visually significant
    try:
        palette = ct.get_palette(color_count=8, quality=5)
    except Exception:
        return '#F5A623'  # fallback

    # Filter out near-white and near-black
    def is_neutral(rgb: tuple) -> bool:
        r, g, b = rgb
        brightness = (r + g + b) / 3
        return brightness > 220 or brightness < 40

    vivid = [c for c in palette if not is_neutral(c)]
    if not vivid:
        vivid = palette  # nothing vivid, use all

    # Pick the most saturated color
    def saturation(rgb: tuple) -> float:
        r, g, b = [x / 255 for x in rgb]
        _, _, s = colorsys.rgb_to_hls(r, g, b)
        return s

    best = max(vivid, key=saturation)
    return rgb_to_hex(*best)


def _normalize_logo(file_bytes: bytes, mime_type: str) -> tuple[bytes, str]:
    """Resize logo to max 400x400, convert to PNG, white background."""
    img = Image.open(io.BytesIO(file_bytes))

    # Convert RGBA to RGB with white background
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        if img.mode in ('RGBA', 'LA'):
            background.paste(img, mask=img.split()[-1])
        else:
            background.paste(img)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize to max 400x400 maintaining aspect ratio
    img.thumbnail((400, 400), Image.LANCZOS)

    # Output as PNG bytes
    output = io.BytesIO()
    img.save(output, format='PNG', optimize=True)
    return output.getvalue(), 'image/png'


def _upload_to_supabase(file_bytes: bytes, storage_path: str) -> str:
    """Upload to 'user-logos' bucket and return signed URL."""
    sb = get_supabase()

    # Upload (upsert — overwrite if exists)
    sb.storage.from_('user-logos').upload(
        path=storage_path,
        file=file_bytes,
        file_options={
            'content-type': 'image/png',
            'upsert': 'true'
        }
    )

    # Generate 365-day signed URL for the logo
    signed = sb.storage.from_('user-logos').create_signed_url(
        storage_path, 365 * 24 * 3600
    )
    return signed['signedURL']


def get_brand_settings(user_id: str) -> dict | None:
    """Fetch user's brand settings from DB. Returns None if not set."""
    sb = get_supabase()
    result = sb.table('user_brand_settings') \
        .select('*') \
        .eq('user_id', user_id) \
        .execute()
    return result.data[0] if result.data else None
