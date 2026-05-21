from functools import wraps
from flask import request, g, abort
from jose import jwt, JWTError
import os

def require_auth(f):
    """Validates NextAuth JWT token and populates g.user_id and g.user_tier."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1]
        if not token:
            abort(401)
        try:
            payload = jwt.decode(
                token,
                os.environ['NEXTAUTH_SECRET'],
                algorithms=['HS256']
            )
            g.user_id   = payload.get('sub')
            g.user_email = payload.get('email')
            g.user_tier = payload.get('tier', 'free')
            if not g.user_id:
                abort(401)
        except JWTError:
            abort(401)
        return f(*args, **kwargs)
    return decorated
