from flask import Blueprint, jsonify
from db import get_supabase
import os

health_bp = Blueprint('health', __name__)

@health_bp.route('/health')
def health():
    checks = {'status': 'ok', 'database': 'unknown', 'version': '1.0.0'}
    try:
        sb = get_supabase()
        sb.table('users').select('id').limit(1).execute()
        checks['database'] = 'ok'
    except Exception as e:
        checks['database'] = f'error: {str(e)[:50]}'
        checks['status'] = 'degraded'
    status_code = 200 if checks['status'] == 'ok' else 503
    return jsonify(checks), status_code
