import pytest
from unittest.mock import patch, MagicMock

def test_valid_youtube_com_url(client, auth_headers):
    with patch('routes.analyze.check_usage_limit'), \
         patch('routes.analyze.get_supabase') as mock_sb, \
         patch('routes.analyze.requests.post') as mock_post:
         
        mock_sb.return_value.table().insert().execute().data = [{'id': '123'}]
        mock_post.return_value.ok = True
        mock_post.return_value.json.return_value = {'runId': 'run_1'}
        
        res = client.post('/api/analyze', json={'video_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}, headers=auth_headers)
        assert res.status_code == 200
        assert res.json['status'] == 'queued'

def test_valid_youtu_be_url(client, auth_headers):
    with patch('routes.analyze.check_usage_limit'), \
         patch('routes.analyze.get_supabase') as mock_sb, \
         patch('routes.analyze.requests.post') as mock_post:
         
        mock_sb.return_value.table().insert().execute().data = [{'id': '123'}]
        mock_post.return_value.ok = True
        
        res = client.post('/api/analyze', json={'video_url': 'https://youtu.be/dQw4w9WgXcQ'}, headers=auth_headers)
        assert res.status_code == 200

def test_valid_shorts_url(client, auth_headers):
    with patch('routes.analyze.check_usage_limit'), \
         patch('routes.analyze.get_supabase') as mock_sb, \
         patch('routes.analyze.requests.post') as mock_post:
         
        mock_sb.return_value.table().insert().execute().data = [{'id': '123'}]
        mock_post.return_value.ok = True
        
        res = client.post('/api/analyze', json={'video_url': 'https://youtube.com/shorts/dQw4w9WgXcQ'}, headers=auth_headers)
        assert res.status_code == 200

def test_invalid_vimeo_url_rejected(client, auth_headers):
    res = client.post('/api/analyze', json={'video_url': 'https://vimeo.com/123456'}, headers=auth_headers)
    assert res.status_code == 400

def test_random_string_rejected(client, auth_headers):
    res = client.post('/api/analyze', json={'video_url': 'not a url'}, headers=auth_headers)
    assert res.status_code == 400

def test_unauthenticated_request_rejected(client):
    res = client.post('/api/analyze', json={'video_url': 'https://youtube.com/watch?v=12345678901'})
    assert res.status_code == 401
