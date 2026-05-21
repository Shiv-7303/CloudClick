import pytest
from app import create_app
from unittest.mock import patch, MagicMock
from jose import jwt
import os

@pytest.fixture
def app():
    # Setup environment for tests
    os.environ['FLASK_SECRET_KEY'] = 'test_secret'
    os.environ['NEXTAUTH_SECRET'] = 'test_nextauth_secret'
    os.environ['INTERNAL_SECRET'] = 'test_internal_secret'
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['APP_URL'] = 'http://localhost:3000'
    
    # We mock Supabase client globally for app tests
    with patch('db.create_client') as mock_create_client:
        mock_sb = MagicMock()
        mock_create_client.return_value = mock_sb
        
        # Avoid Sentry init in tests
        with patch('sentry_sdk.init'):
            app = create_app()
            app.config['TESTING'] = True
            
            # Attach the mock to the app so tests can configure it
            app.mock_sb = mock_sb
            yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers():
    token = jwt.encode(
        {'sub': 'user123', 'email': 'test@example.com', 'tier': 'free'},
        'test_nextauth_secret',
        algorithm='HS256'
    )
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def paid_auth_headers():
    token = jwt.encode(
        {'sub': 'user456', 'email': 'creator@example.com', 'tier': 'creator'},
        'test_nextauth_secret',
        algorithm='HS256'
    )
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def pro_auth_headers():
    token = jwt.encode(
        {'sub': 'user789', 'email': 'pro@example.com', 'tier': 'pro'},
        'test_nextauth_secret',
        algorithm='HS256'
    )
    return {'Authorization': f'Bearer {token}'}
