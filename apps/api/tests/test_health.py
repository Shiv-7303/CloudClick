import pytest
from unittest.mock import patch

def test_health_ok_when_db_connected(client):
    with patch('routes.health.get_supabase') as mock_sb:
        # Mock successful db hit
        mock_sb.return_value.table().select().limit().execute.return_value = True
        
        res = client.get('/health')
        assert res.status_code == 200
        assert res.json['status'] == 'ok'
        assert res.json['database'] == 'ok'

def test_health_degraded_when_db_fails(client):
    with patch('routes.health.get_supabase') as mock_sb:
        # Mock failing db hit
        mock_sb.return_value.table().select().limit().execute.side_effect = Exception("DB Timeout")
        
        res = client.get('/health')
        assert res.status_code == 503
        assert res.json['status'] == 'degraded'
        assert 'error' in res.json['database']
