"""
Carousel Theme Definitions
─────────────────────────
Each theme is a dict of CSS variable values.
Used by the Jinja2 template renderer.
"""

THEMES = {
    'dark': {
        'bg':           'linear-gradient(135deg, #0A0A0A 0%, #111111 100%)',
        'card_bg':      '#111111',
        'card_border':  '#222222',
        'accent':       '#F5A623',
        'accent_dark':  '#A87018',
        'text_head':    '#F5F5F0',
        'text_body':    '#8C8C8C',
        'text_label':   '#F5A623',
        'text_slide_num': '#4A4A4A',
        'card_shadow':  '0 24px 80px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6)',
        'card_class':   '',
    },
    'gradient': {
        'bg':           'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
        'card_bg':      'rgba(255,255,255,0.06)',
        'card_border':  'rgba(255,255,255,0.12)',
        'accent':       '#A78BFA',
        'accent_dark':  '#7C3AED',
        'text_head':    '#FFFFFF',
        'text_body':    'rgba(255,255,255,0.72)',
        'text_label':   '#A78BFA',
        'text_slide_num': 'rgba(255,255,255,0.35)',
        'card_shadow':  '0 32px 80px rgba(0,0,0,0.5)',
        'card_class':   'glass',
    },
    'minimal': {
        'bg':           '#F0F0EC',
        'card_bg':      '#FFFFFF',
        'card_border':  'transparent',
        'accent':       '#1A1A1A',
        'accent_dark':  '#000000',
        'text_head':    '#0A0A0A',
        'text_body':    '#555555',
        'text_label':   '#888888',
        'text_slide_num': '#BBBBBB',
        'card_shadow':  '0 12px 60px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'card_class':   '',
    },
    'bold': {
        'bg':           '#0A0A0A',
        'card_bg':      '#FFFFFF',
        'card_border':  'transparent',
        'accent':       '#FF3B30',
        'accent_dark':  '#CC2E24',
        'text_head':    '#0A0A0A',
        'text_body':    '#333333',
        'text_label':   '#FF3B30',
        'text_slide_num': '#CCCCCC',
        'card_shadow':  '0 20px 60px rgba(255,59,48,0.25), 0 4px 16px rgba(0,0,0,0.3)',
        'card_class':   '',
    },
}


def build_brand_theme(brand_color_hex: str, brand_color_dark: str,
                      brand_color_light: str, text_on_brand: str) -> dict:
    """
    Generates a 'brand' theme from extracted logo colors.
    Called when paid user has uploaded a logo.
    """
    return {
        'bg':           f'linear-gradient(135deg, {brand_color_dark} 0%, {_mix(brand_color_dark, "#000000", 0.3)} 100%)',
        'card_bg':      '#FFFFFF',
        'card_border':  'transparent',
        'accent':       brand_color_hex,
        'accent_dark':  brand_color_dark,
        'text_head':    '#0A0A0A',
        'text_body':    '#444444',
        'text_label':   brand_color_hex,
        'text_slide_num': '#AAAAAA',
        'card_shadow':  f'0 20px 60px {brand_color_hex}33, 0 4px 16px rgba(0,0,0,0.2)',
        'card_class':   '',
    }


def _mix(hex1: str, hex2: str, ratio: float) -> str:
    """Mix two hex colors. ratio=0 → hex1, ratio=1 → hex2."""
    from services.logo_processor import hex_to_rgb, rgb_to_hex
    r1, g1, b1 = hex_to_rgb(hex1)
    r2, g2, b2 = hex_to_rgb(hex2)
    r = int(r1 * (1 - ratio) + r2 * ratio)
    g = int(g1 * (1 - ratio) + g2 * ratio)
    b = int(b1 * (1 - ratio) + b2 * ratio)
    return rgb_to_hex(r, g, b)


def get_theme(theme_name: str, brand_settings: dict | None = None) -> dict:
    """
    Returns the theme dict for a given theme name.
    If theme_name == 'brand', uses brand_settings to build dynamic theme.
    Falls back to 'dark' if theme not found.
    """
    if theme_name == 'brand' and brand_settings:
        return build_brand_theme(
            brand_settings.get('brand_color_hex', '#F5A623'),
            brand_settings.get('brand_color_dark', '#A87018'),
            brand_settings.get('brand_color_light', '#FAD07A'),
            brand_settings.get('text_on_brand', '#FFFFFF'),
        )
    return THEMES.get(theme_name, THEMES['dark'])