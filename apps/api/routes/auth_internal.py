from flask import Blueprint, request, jsonify, abort
from db import get_supabase
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/upsert-user', methods=['POST'])
def upsert_user():
    # Validate internal secret — only NextAuth server calls this
    secret = request.headers.get('X-Internal-Secret', '')
    if secret != os.environ.get('INTERNAL_SECRET'):
        abort(401)

    data = request.get_json()
    email = data.get('email')
    name  = data.get('name')
    image = data.get('image')

    if not email:
        abort(400, 'email required')

    sb = get_supabase()
    # Upsert: insert or update on conflict
    result = sb.table('users').upsert(
        {'email': email, 'name': name, 'avatar_url': image},
        on_conflict='email'
    ).execute()

    user = result.data[0] if result.data else None
    if not user:
        abort(500, 'Failed to upsert user')

    return jsonify({'id': user['id'], 'tier': user['tier']})
