"""
Carousel Renderer
─────────────────
Converts carousel_slides data (from Claude) into rendered PNG images.

Pipeline:
1. Accept carousel_slides list + user tier + theme + brand settings
2. Build Jinja2 context per slide
3. Render HTML per slide
4. Use Playwright to screenshot each at 1080x1080
5. Return list of PNG bytes

Dependencies:
  pip install jinja2 playwright
  playwright install chromium
"""

import os
import io
import asyncio
import base64
import tempfile
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from services.themes import get_theme
from services.logo_processor import get_brand_settings

# ── Jinja2 environment ────────────────────────────────────────────────

TEMPLATE_DIR = Path(__file__).parent.parent / 'templates' / 'carousel'

jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html']),
)


# ── CSS builder ───────────────────────────────────────────────────────

def _build_css(theme: dict, watermark_prominent: bool) -> str:
    """Render the CSS template with theme variables."""
    css_template = jinja_env.get_template('styles.css.j2')
    return css_template.render(
        theme=theme,
        watermark_prominent=watermark_prominent
    )


# ── Slide context builder ─────────────────────────────────────────────

def _build_slide_contexts(
    carousel_slides: list[dict],
    user_tier: str,
    theme: dict,
    brand_settings: dict | None,
    logo_url: str | None,
    video_title: str,
) -> list[dict]:
    """
    Converts raw carousel_slides from Claude into per-slide render contexts.

    Claude output format (per slide):
        {title: str, body: str, slide_number: int, emoji: str (optional)}

    We enrich each slide with:
        - label (derived from slide number/type)
        - bullets (if body has line breaks, split into list)
        - stat (if body starts with a number, extract it)
        - logo_url (if paid + uploaded)
        - watermark_text
        - theme CSS variables
    """
    total = len(carousel_slides)

    # Watermark logic
    watermark_text = None
    watermark_prominent = False
    if user_tier == 'free':
        watermark_text = 'Created with CloudClick'
        watermark_prominent = True       # Large, visible
    elif user_tier == 'creator':
        watermark_text = 'cloudclick.app'
        watermark_prominent = False      # Small, subtle

    # Labels per slide position
    default_labels = [
        'The Problem',
        'Key Insight',
        'The Reality',
        'What to Do',
        'The Proof',
        'Your Next Step',
    ]

    contexts = []
    css = _build_css(theme, watermark_prominent)

    for i, slide in enumerate(carousel_slides):
        slide_num   = i + 1
        is_first    = slide_num == 1
        is_last     = slide_num == total
        raw_body    = slide.get('body', '')

        # Detect bullet-list content (body has 3+ short lines)
        lines = [l.strip() for l in raw_body.split('\n') if l.strip()]
        is_bullets = len(lines) >= 3 and all(len(l) < 100 for l in lines)
        bullets    = lines if is_bullets else None
        body       = raw_body if not is_bullets else ''

        # Detect stat (body starts with number or %)
        stat = None
        if body and (body[0].isdigit() or body.startswith('%') or body.startswith('$') or body.startswith('₹')):
            parts = body.split(' ', 1)
            if len(parts[0]) < 10:
                stat = parts[0]
                body = parts[1] if len(parts) > 1 else body

        label = slide.get('label') or default_labels[min(i, len(default_labels) - 1)]

        context = {
            'css':           css,
            'card_class':    theme.get('card_class', ''),
            'slide_number':  slide_num,
            'total_slides':  total,
            'label':         label,
            'title':         slide.get('title', ''),
            'body':          body,
            'bullets':       bullets,
            'stat':          stat,
            'logo_url':      logo_url if brand_settings else None,
            'watermark_text': watermark_text,
            'watermark_prominent': watermark_prominent,
            'cta_text':      'Save this. Share it. Come back weekly.' if is_last else None,
        }
        contexts.append((slide_num, is_first, is_last, context))

    return contexts


# ── Playwright renderer ───────────────────────────────────────────────

async def _render_slides_async(
    slide_contexts: list,
) -> list[bytes]:
    """
    Renders each slide as 1080x1080 PNG using Playwright.
    Returns list of PNG bytes in slide order.
    """
    from playwright.async_api import async_playwright

    png_bytes_list = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--font-render-hinting=none',
            ]
        )
        page = await browser.new_page(
            viewport={'width': 1080, 'height': 1080},
            device_scale_factor=2,       # 2x = 2160×2160 → downscale for crisp output
        )

        for slide_num, is_first, is_last, context in slide_contexts:
            # Pick template
            if is_first:
                template_name = 'slide_hook.html'
            elif is_last:
                template_name = 'slide_cta.html'
            else:
                template_name = 'slide_content.html'

            template = jinja_env.get_template(template_name)
            html_content = template.render(**context)

            # Write to temp file (Playwright needs file:// for local font loading)
            with tempfile.NamedTemporaryFile(
                suffix='.html', mode='w', delete=False, encoding='utf-8'
            ) as f:
                f.write(html_content)
                tmp_path = f.name

            try:
                await page.goto(f'file://{tmp_path}', wait_until='networkidle')
                await page.wait_for_timeout(800)   # wait for Google Fonts to load

                png = await page.screenshot(
                    type='png',
                    clip={'x': 0, 'y': 0, 'width': 1080, 'height': 1080},
                    full_page=False,
                )
                png_bytes_list.append(png)
            finally:
                os.unlink(tmp_path)

        await browser.close()

    return png_bytes_list


def render_carousel(
    carousel_slides: list[dict],
    user_id: str,
    user_tier: str,
    theme_name: str = 'dark',
    video_title: str = '',
) -> list[bytes]:
    """
    Main public function.

    Args:
        carousel_slides: list of {title, body, slide_number} from Claude
        user_id:         for fetching brand settings
        user_tier:       'free' | 'creator' | 'pro'
        theme_name:      'dark' | 'gradient' | 'minimal' | 'bold' | 'brand'
        video_title:     for first slide fallback

    Returns:
        List of PNG bytes, one per slide.

    Raises:
        ValueError if carousel_slides is empty
    """
    if not carousel_slides:
        raise ValueError("No carousel slides to render")

    # Fetch brand settings (logo URL, brand color) for paid users
    brand_settings = None
    logo_url = None
    if user_tier in ('creator', 'pro'):
        brand_settings = get_brand_settings(user_id)
        if brand_settings:
            logo_url = brand_settings.get('logo_url')

    # If theme is 'brand' but no brand settings, fall back to 'dark'
    if theme_name == 'brand' and not brand_settings:
        theme_name = 'dark'

    theme = get_theme(theme_name, brand_settings)

    # Build per-slide contexts
    slide_contexts = _build_slide_contexts(
        carousel_slides, user_tier, theme, brand_settings, logo_url, video_title
    )

    # Run async Playwright renderer in sync context
    png_list = asyncio.run(_render_slides_async(slide_contexts))
    return png_list

async def _render_slides_pdf_async(
    slide_contexts: list,
) -> bytes:
    """
    Renders all slides sequentially into a single PDF.
    """
    from playwright.async_api import async_playwright

    # Combine slides into one HTML with page breaks
    combined_html = "<!DOCTYPE html><html><head><style>"
    combined_html += "@page { size: 1080px 1080px; margin: 0; }"
    combined_html += "body { margin: 0; padding: 0; }"
    combined_html += ".slide-page { width: 1080px; height: 1080px; page-break-after: always; position: relative; display: flex; align-items: center; justify-content: center; }"
    
    # We pass the theme_dict so the CSS variables are populated. 
    # Use the CSS from the first context as it's the same for all.
    combined_html += slide_contexts[0][3]['css']
    combined_html += "</style></head><body>"
    
    for slide_num, is_first, is_last, context in slide_contexts:
        if is_first:
            template_name = 'slide_hook.html'
        elif is_last:
            template_name = 'slide_cta.html'
        else:
            template_name = 'slide_content.html'

        template = jinja_env.get_template(template_name)
        html_content = template.render(**context)
        
        # Extract body content and class
        try:
            body_content = html_content.split('<body')[1].split('>', 1)[1].split('</body>')[0]
            body_class = ""
            if 'class="' in html_content.split('<body')[1].split('>', 1)[0]:
                body_class = html_content.split('<body')[1].split('class="')[1].split('"')[0]
                
            combined_html += f'<div class="slide-page {body_class}" style="background: var(--bg);">{body_content}</div>'
        except IndexError:
            combined_html += f'<div class="slide-page">{html_content}</div>'
            
    combined_html += "</body></html>"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
            ]
        )
        page = await browser.new_page()
        
        with tempfile.NamedTemporaryFile(
            suffix='.html', mode='w', delete=False, encoding='utf-8'
        ) as f:
            f.write(combined_html)
            tmp_path = f.name
            
        try:
            await page.goto(f'file://{tmp_path}', wait_until='networkidle')
            await page.wait_for_timeout(800)
            
            pdf_bytes = await page.pdf(
                width="1080px",
                height="1080px",
                print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
            )
        finally:
            os.unlink(tmp_path)
            
        await browser.close()
        
    return pdf_bytes

def render_carousel_pdf(
    carousel_slides: list[dict],
    user_id: str,
    user_tier: str,
    theme_name: str = 'dark',
    video_title: str = '',
) -> bytes:
    """Wrapper for async PDF generation."""
    if not carousel_slides:
        raise ValueError("No carousel slides to render")

    brand_settings = None
    logo_url = None
    if user_tier in ('creator', 'pro'):
        brand_settings = get_brand_settings(user_id)
        if brand_settings:
            logo_url = brand_settings.get('logo_url')

    if theme_name == 'brand' and not brand_settings:
        theme_name = 'dark'

    theme = get_theme(theme_name, brand_settings)
    slide_contexts = _build_slide_contexts(
        carousel_slides, user_tier, theme, brand_settings, logo_url, video_title
    )

    return asyncio.run(_render_slides_pdf_async(slide_contexts))