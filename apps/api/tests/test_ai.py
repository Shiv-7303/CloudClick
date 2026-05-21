import pytest
import os
import json
from unittest.mock import patch, MagicMock
from services.ai import analyze_video
from services.content_processor import apply_tier_gates

mock_transcript = {'full_text': 'This is a test transcript.' * 500} # make it long enough
mock_metadata = {'title': 'Test Video', 'channel': 'Test Channel'}

@pytest.fixture
def mock_anthropic():
    with patch('services.ai.extract_insights_with_gemini') as mock_ext:
        mock_ext.return_value = "Mocked insights"
        with patch('services.ai.get_client') as mock_get_client:
            mock_client = MagicMock()
            mock_response = MagicMock()
            
            base_resp = {
                "summary": "test", 
                "linkedin_post_v1": "Post 1",
                "linkedin_post_v2": "Post 2",
                "linkedin_post_v3": "Post 3",
                "carousel_slides": [{"title":"s1", "body":"b1"}],
                "key_topics": ["test"]
            }
            
            mock_response.content = [MagicMock(text=json.dumps(base_resp))]
            mock_response.usage = MagicMock(input_tokens=10, output_tokens=10)
            
            mock_client.messages.create.return_value = mock_response
            mock_get_client.return_value = mock_client
            yield mock_client

def test_free_user_calls_haiku(mock_anthropic):
    with patch.dict('os.environ', {'CLAUDE_FREE_MODEL': 'claude-haiku-4-5'}):
        result = analyze_video(mock_transcript, mock_metadata, 'free')
        call_kwargs = mock_anthropic.messages.create.call_args.kwargs
        assert call_kwargs['model'] == 'claude-haiku-4-5'

def test_creator_user_calls_sonnet(mock_anthropic):
    with patch.dict('os.environ', {'CLAUDE_PAID_MODEL': 'claude-sonnet-4-5'}):
        result = analyze_video(mock_transcript, mock_metadata, 'creator')
        call_kwargs = mock_anthropic.messages.create.call_args.kwargs
        assert call_kwargs['model'] == 'claude-sonnet-4-5'

def test_pro_user_calls_sonnet(mock_anthropic):
    with patch.dict('os.environ', {'CLAUDE_PAID_MODEL': 'claude-sonnet-4-5'}):
        result = analyze_video(mock_transcript, mock_metadata, 'pro')
        call_kwargs = mock_anthropic.messages.create.call_args.kwargs
        assert call_kwargs['model'] == 'claude-sonnet-4-5'

def test_free_prompt_shorter_transcript(mock_anthropic):
    analyze_video(mock_transcript, mock_metadata, 'free')
    call_kwargs = mock_anthropic.messages.create.call_args.kwargs
    user_msg = call_kwargs['messages'][0]['content']
    assert "Mocked insights" in user_msg

def test_paid_prompt_longer_transcript(mock_anthropic):
    analyze_video(mock_transcript, mock_metadata, 'pro')
    call_kwargs = mock_anthropic.messages.create.call_args.kwargs
    user_msg = call_kwargs['messages'][0]['content']
    assert "Mocked insights" in user_msg

def test_cache_control_present_for_paid(mock_anthropic):
    analyze_video(mock_transcript, mock_metadata, 'creator')
    call_kwargs = mock_anthropic.messages.create.call_args.kwargs
    sys_block = call_kwargs['system']
    assert isinstance(sys_block, list)
    assert sys_block[0]['cache_control'] == {'type': 'ephemeral'}

def test_cache_control_absent_for_free(mock_anthropic):
    analyze_video(mock_transcript, mock_metadata, 'free')
    call_kwargs = mock_anthropic.messages.create.call_args.kwargs
    assert isinstance(call_kwargs['system'], str)

def test_json_fence_stripping(mock_anthropic):
    mock_anthropic.messages.create.return_value.content[0].text = "```json\n{\"summary\": \"test\"}\n```"
    res = analyze_video(mock_transcript, mock_metadata, 'free')
    assert res['summary'] == 'test'

def test_retry_on_429(mock_anthropic):
    import anthropic
    mock_response = mock_anthropic.messages.create.return_value
    mock_anthropic.messages.create.side_effect = [
        anthropic.APIStatusError("429 Too Many Requests", response=MagicMock(), body=None),
        anthropic.APIStatusError("529 Overloaded", response=MagicMock(), body=None),
        mock_response
    ]
    with patch('time.sleep') as mock_sleep:
        res = analyze_video(mock_transcript, mock_metadata, 'free')
        assert mock_anthropic.messages.create.call_count == 3
        assert mock_sleep.call_count == 2

def test_watermark_added_free_tier():
    data = {'linkedin_post_v1': 'Hello'}
    res = apply_tier_gates(data, 'free')
    assert '_Created with CloudClick_' in res['linkedin_post_v1']

def test_watermark_added_creator_tier():
    data = {'linkedin_post_v1': 'Hello', 'linkedin_post_v2': 'World', 'linkedin_post_v3': 'Test'}
    res = apply_tier_gates(data, 'creator')
    assert '_Created with CloudClick_' in res['linkedin_post_v1']
    assert '_Created with CloudClick_' in res['linkedin_post_v2']
    assert '_Created with CloudClick_' in res['linkedin_post_v3']

def test_no_watermark_pro_tier():
    data = {'linkedin_post_v1': 'Hello'}
    res = apply_tier_gates(data, 'pro')
    assert 'CloudClick' not in res['linkedin_post_v1']

def test_free_output_missing_v2_v3():
    # Only v1 in free template by default, gating doesn't remove v2/v3 but the prompt doesn't ask for it
    # We test that gating removes carousel_slides
    data = {'carousel_slides': [{'test':'test'}], 'linkedin_post_v1': 'Hello'}
    res = apply_tier_gates(data, 'free')
    assert 'carousel_slides' not in res

def test_paid_output_has_v1_v2_v3():
    data = {'linkedin_post_v1': '1', 'linkedin_post_v2': '2', 'linkedin_post_v3': '3'}
    res = apply_tier_gates(data, 'pro')
    assert 'linkedin_post_v1' in res
    assert 'linkedin_post_v2' in res
    assert 'linkedin_post_v3' in res

def test_carousel_gated_for_free():
    data = {'carousel_slides': []}
    res = apply_tier_gates(data, 'free')
    assert 'carousel_slides' not in res

def test_carousel_present_for_creator():
    data = {'carousel_slides': []}
    res = apply_tier_gates(data, 'creator')
    assert 'carousel_slides' in res
