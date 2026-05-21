import pytest
from services.content_processor import validate_playbook, apply_tier_gates

# ── validate_playbook tests ────────────────────────────────────

def test_validate_playbook_returns_empty_on_none():
    assert validate_playbook(None) == []

def test_validate_playbook_returns_empty_on_empty_list():
    assert validate_playbook([]) == []

def test_validate_playbook_requires_hook():
    """Days with empty hooks are filtered out."""
    days = [
        {'day': 1, 'content_type': 'Hot Take', 'hook': '', 'angle': 'some angle', 'format': 'Talking Head Reel'},
        {'day': 2, 'content_type': 'Educational', 'hook': 'Real hook here', 'angle': 'angle', 'format': 'Carousel'},
    ]
    result = validate_playbook(days)
    assert len(result) == 1
    assert result[0]['hook'] == 'Real hook here'

def test_validate_playbook_renumbers_days():
    days = [
        {'day': 5, 'content_type': 'Hot Take', 'hook': 'Hook A', 'angle': 'Angle', 'format': 'Talking Head Reel'},
        {'day': 9, 'content_type': 'Educational', 'hook': 'Hook B', 'angle': 'Angle', 'format': 'Carousel'},
    ]
    result = validate_playbook(days)
    assert result[0]['day'] == 1
    assert result[1]['day'] == 2

def test_validate_playbook_all_7_days_preserved():
    days = [
        {'day': i, 'content_type': 'Educational', 'hook': f'Hook {i}', 'angle': 'Angle', 'format': 'Talking Head Reel'}
        for i in range(1, 8)
    ]
    result = validate_playbook(days)
    assert len(result) == 7

def test_validate_playbook_strips_whitespace_from_hook():
    days = [{'day': 1, 'content_type': 'Hot Take', 'hook': '  Trimmed hook  ', 'angle': 'angle', 'format': 'Reel'}]
    result = validate_playbook(days)
    assert result[0]['hook'] == 'Trimmed hook'

# ── apply_tier_gates playbook gating tests ──────────────────────

def make_result_with_playbook(num_days: int) -> dict:
    return {
        'summary': 'Test summary',
        'linkedin_post_v1': 'Test post',
        'twitter_thread': [],
        'key_topics': [],
        'instagram_playbook': [
            {'day': i, 'content_type': 'Educational', 'hook': f'Hook {i}', 'angle': 'Angle', 'format': 'Talking Head Reel'}
            for i in range(1, num_days + 1)
        ]
    }

def test_free_user_gets_max_3_days():
    result = make_result_with_playbook(3)
    gated = apply_tier_gates(result, 'free')
    assert len(gated['instagram_playbook']) == 3

def test_free_user_extra_days_trimmed():
    """Safety: even if AI returns 7 days for free user, gate trims to 3."""
    result = make_result_with_playbook(7)
    gated = apply_tier_gates(result, 'free')
    assert len(gated['instagram_playbook']) <= 3

def test_creator_user_gets_7_days():
    result = make_result_with_playbook(7)
    gated = apply_tier_gates(result, 'creator')
    assert len(gated['instagram_playbook']) == 7

def test_pro_user_gets_7_days():
    result = make_result_with_playbook(7)
    gated = apply_tier_gates(result, 'pro')
    assert len(gated['instagram_playbook']) == 7

def test_missing_playbook_returns_empty_list():
    """Defensive: if AI somehow doesn't return playbook key."""
    result = {'summary': 'Test', 'linkedin_post_v1': 'Post', 'twitter_thread': [], 'key_topics': []}
    gated = apply_tier_gates(result, 'creator')
    assert gated.get('instagram_playbook') == []

def test_playbook_days_have_required_fields():
    result = make_result_with_playbook(7)
    gated = apply_tier_gates(result, 'creator')
    for day in gated['instagram_playbook']:
        assert 'day' in day
        assert 'hook' in day
        assert 'angle' in day
        assert 'format' in day
        assert 'content_type' in day