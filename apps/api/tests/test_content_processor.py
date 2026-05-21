import pytest
from services.content_processor import apply_watermark, validate_twitter_thread, apply_tier_gates

def test_apply_watermark():
    data = {
        'linkedin_post_v1': 'Post 1',
        'linkedin_post_v2': 'Post 2',
        'linkedin_post_v3': 'Post 3'
    }
    
    # Pro tier -> no watermark
    res = apply_watermark(data.copy(), 'pro')
    assert 'CloudClick' not in res['linkedin_post_v1']
    assert 'CloudClick' not in res['linkedin_post_v2']
    
    # Free tier -> watermark only on v1
    res = apply_watermark(data.copy(), 'free')
    assert 'CloudClick' in res['linkedin_post_v1']
    assert 'CloudClick' not in res['linkedin_post_v2']
    
    # Creator tier -> watermark on all 3
    res = apply_watermark(data.copy(), 'creator')
    assert 'CloudClick' in res['linkedin_post_v1']
    assert 'CloudClick' in res['linkedin_post_v2']
    assert 'CloudClick' in res['linkedin_post_v3']

def test_validate_twitter_thread():
    long_text = "A" * 300
    long_text_with_spaces = "Hello " * 50
    thread = [
        {"text": "Normal tweet", "position": 5}, # Position should be corrected
        {"text": "", "position": 2}, # Empty should be filtered
        {"text": long_text, "position": 3}, # Should truncate
        {"text": long_text_with_spaces, "position": 4} # Should truncate at space
    ]
    
    res = validate_twitter_thread(thread)
    
    assert len(res) == 3
    assert res[0]['text'] == "Normal tweet"
    assert res[0]['position'] == 1
    
    assert len(res[1]['text']) <= 280
    assert res[1]['text'].endswith('...')
    assert res[1]['position'] == 2
    
    assert len(res[2]['text']) <= 280
    assert res[2]['text'].endswith('...')
    assert res[2]['position'] == 3

def test_apply_tier_gates():
    base_data = {
        'summary': 'Test',
        'twitter_thread': [{'text': 'tweet'}],
        'carousel_preview': [],
        'carousel_slides': [],
        'content_calendar': [],
        'engagement_ctas': [],
        'content_angles': {},
        'linkedin_post_v1': 'Post'
    }
    
    # Free
    res_free = apply_tier_gates(base_data.copy(), 'free')
    assert 'carousel_slides' not in res_free
    assert 'content_calendar' not in res_free
    assert 'engagement_ctas' not in res_free
    assert 'content_angles' not in res_free
    assert 'carousel_preview' in res_free
    assert 'CloudClick' in res_free['linkedin_post_v1']
    assert res_free['twitter_thread'][0]['position'] == 1
    
    # Creator
    res_creator = apply_tier_gates(base_data.copy(), 'creator')
    assert 'carousel_slides' in res_creator
    assert 'content_calendar' in res_creator
    assert 'engagement_ctas' in res_creator
    assert 'content_angles' not in res_creator
    assert 'CloudClick' in res_creator['linkedin_post_v1']
    
    # Pro
    res_pro = apply_tier_gates(base_data.copy(), 'pro')
    assert 'content_angles' in res_pro
    assert 'CloudClick' not in res_pro['linkedin_post_v1']
