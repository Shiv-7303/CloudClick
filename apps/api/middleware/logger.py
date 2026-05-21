import time, logging
from flask import request, g

# Silence default Flask/Werkzeug request logging
logging.getLogger('werkzeug').setLevel(logging.ERROR)

logging.basicConfig(
    format='%(asctime)s %(levelname)s %(message)s',
    level=logging.INFO
)
logger = logging.getLogger('cloudclick')

def register_logging(app):
    @app.before_request
    def start_timer():
        g.t0 = time.time()

    @app.after_request
    def log_request(response):
        ms = round((time.time() - g.get('t0', time.time())) * 1000)
        tier = getattr(g, 'user_tier', 'anon')
        # Log only important API routes to avoid terminal spam
        if request.path.startswith('/api/'):
            logger.info(f"{request.method} {request.path} → {response.status_code} [{ms}ms] tier={tier}")
        return response
