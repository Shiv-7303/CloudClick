WATERMARK = "\n\n—\n_Created with CloudClick_"

def apply_watermark(result: dict, tier: str) -> dict:
    """Applies watermark to posts based on tier."""
    if tier == 'pro':
        return result
    
    if tier == 'free':
        if 'linkedin_post_v1' in result and result['linkedin_post_v1']:
            result['linkedin_post_v1'] += WATERMARK
    elif tier == 'creator':
        for key in ['linkedin_post_v1', 'linkedin_post_v2', 'linkedin_post_v3']:
            if key in result and result[key]:
                result[key] += WATERMARK
                
    return result

def validate_twitter_thread(thread: list) -> list:
    """Validates and trims twitter thread items."""
    if not thread or not isinstance(thread, list):
        return []
    
    validated = []
    position = 1
    
    for item in thread:
        if not isinstance(item, dict):
            continue
            
        text = item.get('text', '').strip()
        if not text:
            continue
            
        if len(text) > 280:
            # Truncate at word boundary
            truncated = text[:277]
            last_space = truncated.rfind(' ')
            if last_space > -1:
                truncated = truncated[:last_space]
            text = truncated + "..."
            
        validated.append({
            'text': text,
            'position': position
        })
        position += 1
        
    return validated

def validate_playbook(playbook: list) -> list:
    """
    Validates and cleans playbook output from AI.
    Ensures each day has required fields.
    Safe to call with empty list.
    """
    if not playbook or not isinstance(playbook, list):
        return []

    valid_formats = {
        'Talking Head Reel', 'Instagram Carousel', 'Facecam Reel',
        'Story Reel', 'Meme Reel', 'Whiteboard Reel', 'Talking Head',
        'Talking Head / Carousel'
    }
    valid_types = {
        'Contrarian Post', 'Educational', 'Story Post', 'Hot Take',
        'Relatable', 'Authority Post', 'Carousel', 'Relatable / Meme Style'
    }

    cleaned = []
    for i, day_item in enumerate(playbook):
        if not isinstance(day_item, dict):
            continue

        cleaned.append({
            'day':          day_item.get('day', i + 1),
            'content_type': day_item.get('content_type', 'Educational'),
            'hook':         str(day_item.get('hook', '')).strip(),
            'angle':        str(day_item.get('angle', '')).strip(),
            'format':       day_item.get('format', 'Talking Head Reel'),
        })

    # Filter days with empty hooks
    cleaned = [d for d in cleaned if d['hook']]

    # Re-number days sequentially
    for idx, day in enumerate(cleaned):
        day['day'] = idx + 1

    return cleaned

def apply_tier_gates(result: dict, tier: str) -> dict:
    """Applies tier-based restrictions and runs post-processing."""
    # Common validation
    if 'twitter_thread' in result:
        result['twitter_thread'] = validate_twitter_thread(result['twitter_thread'])

    # ── EXISTING GATES (do not modify) ──────────────────────
    if tier == 'free':
        result.pop('carousel_slides', None)
        result.pop('content_calendar', None)
        result.pop('engagement_ctas', None)
        result.pop('content_angles', None)
        result.pop('linkedin_post_v2', None)
        result.pop('linkedin_post_v3', None)

    if tier != 'pro':
        result.pop('content_angles', None)

    # ── NEW: PLAYBOOK GATING ─────────────────────────────────
    playbook = result.get('instagram_playbook')

    if playbook and isinstance(playbook, list):
        if tier == 'free':
            # Free users: keep only days 1-3
            result['instagram_playbook'] = playbook[:3]
            result['instagram_playbook_locked_days'] = []  # no locked days shown
        elif tier in ('creator', 'pro'):
            # Paid users: all 7 days
            result['instagram_playbook'] = playbook[:7]
            result['instagram_playbook_locked_days'] = []
    elif playbook is None:
        # AI didn't generate playbook (shouldn't happen, but defensive)
        result['instagram_playbook'] = []
        result['instagram_playbook_locked_days'] = []

    # Apply watermarks
    return apply_watermark(result, tier)
