import pytest
import hmac
import hashlib
import json
from unittest.mock import patch, MagicMock

@pytest.fixture
def webhook_secret():
    return 'test_secret'

def generate_signature(payload_str, secret):
    return hmac.new(
        secret.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def test_valid_hmac_webhook_processes(client, webhook_secret):
    payload = {'id': 'evt_1', 'event': 'subscription.activated', 'payload': {'subscription': {'entity': {'plan_id': 'test_plan', 'notes': {'user_id': 'u1', 'tier': 'pro'}, 'id': 'sub_1'}}}}
    payload_str = json.dumps(payload)
    sig = generate_signature(payload_str, webhook_secret)
    
    with patch('routes.payments.os.environ.get') as mock_env, \
         patch('routes.payments.get_supabase') as mock_sb:
        mock_env.return_value = webhook_secret
        
        response = client.post('/api/payments/webhook', data=payload_str, headers={'X-Razorpay-Signature': sig, 'Content-Type': 'application/json'})
        assert response.status_code == 200

def test_invalid_hmac_returns_401(client, webhook_secret):
    payload = {'id': 'evt_1'}
    payload_str = json.dumps(payload)
    
    with patch('routes.payments.os.environ.get') as mock_env:
        mock_env.return_value = webhook_secret
        response = client.post('/api/payments/webhook', data=payload_str, headers={'X-Razorpay-Signature': 'invalid', 'Content-Type': 'application/json'})
        assert response.status_code == 401
        assert response.json['error'] == 'Invalid signature'

def test_duplicate_event_returns_duplicate_flag(client, webhook_secret):
    payload = {'id': 'evt_1', 'event': 'test'}
    payload_str = json.dumps(payload)
    sig = generate_signature(payload_str, webhook_secret)
    
    with patch('routes.payments.os.environ.get') as mock_env, \
         patch('routes.payments.get_supabase') as mock_sb:
        mock_env.return_value = webhook_secret
        # Make insert raise an exception (simulating unique constraint violation)
        mock_sb.return_value.table().insert().execute.side_effect = Exception("Duplicate")
        
        response = client.post('/api/payments/webhook', data=payload_str, headers={'X-Razorpay-Signature': sig, 'Content-Type': 'application/json'})
        assert response.status_code == 200
        assert response.json['note'] == 'duplicate'

def test_subscription_activated_updates_tier():
    from routes.payments import process_razorpay_event
    mock_sb = MagicMock()
    mock_users_table = MagicMock()
    mock_subs_table = MagicMock()
    
    def mock_table(name):
        if name == 'users': return mock_users_table
        if name == 'subscriptions': return mock_subs_table
        return MagicMock()
        
    mock_sb.table.side_effect = mock_table
    event = {'payload': {'subscription': {'entity': {'id': 'sub_1', 'plan_id': 'p1', 'notes': {'user_id': 'u1', 'tier': 'pro'}}}}}
    process_razorpay_event('subscription.activated', event, mock_sb)
    
    mock_users_table.update.assert_called_with({'tier': 'pro'})
    mock_subs_table.upsert.assert_called()

def test_subscription_cancelled_reverts_to_free():
    from routes.payments import process_razorpay_event
    mock_sb = MagicMock()
    mock_users_table = MagicMock()
    mock_subs_table = MagicMock()
    
    def mock_table(name):
        if name == 'users': return mock_users_table
        if name == 'subscriptions': return mock_subs_table
        return MagicMock()
        
    mock_sb.table.side_effect = mock_table
    event = {'payload': {'subscription': {'entity': {'id': 'sub_1', 'notes': {'user_id': 'u1'}}}}}
    process_razorpay_event('subscription.cancelled', event, mock_sb)
    
    mock_users_table.update.assert_called_with({'tier': 'free'})
    mock_subs_table.update.assert_called_with({'status': 'cancelled', 'cancelled_at': 'NOW()'})

def test_subscription_expired_reverts_to_free():
    from routes.payments import process_razorpay_event
    mock_sb = MagicMock()
    mock_users_table = MagicMock()
    mock_subs_table = MagicMock()
    
    def mock_table(name):
        if name == 'users': return mock_users_table
        if name == 'subscriptions': return mock_subs_table
        return MagicMock()
        
    mock_sb.table.side_effect = mock_table
    event = {'payload': {'subscription': {'entity': {'id': 'sub_1', 'notes': {'user_id': 'u1'}}}}}
    process_razorpay_event('subscription.expired', event, mock_sb)
    
    mock_users_table.update.assert_called_with({'tier': 'free'})

def test_invalid_tier_in_create_subscription_returns_400(client, auth_headers):
    response = client.post('/api/payments/create-subscription', json={'tier': 'invalid'}, headers=auth_headers)
    assert response.status_code == 400

def test_missing_plan_id_env_returns_mock(client, auth_headers):
    with patch.dict('routes.payments.PLAN_IDS', {'pro': None}), \
         patch('routes.payments.get_supabase') as mock_sb:
        
        mock_result = MagicMock()
        mock_result.data = [{'email': 'test@test.com', 'name': 'Test'}]
        mock_sb.return_value.table().select().eq().execute.return_value = mock_result
        
        response = client.post('/api/payments/create-subscription', json={'tier': 'pro'}, headers=auth_headers)
        assert response.status_code == 200
        assert response.json['is_mock'] == True
