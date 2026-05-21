from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
import os
from werkzeug.exceptions import HTTPException

class PaymentRequired(HTTPException):
    code = 402
    description = "Payment required."

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour"],
    storage_uri="memory://"   # ← upgrade to Redis URL when needed at scale
)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ['FLASK_SECRET_KEY']
    app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024  # 2MB max body
    app.config['DEBUG'] = True

    # Sentry
    if os.environ.get('SENTRY_DSN'):
        sentry_sdk.init(
            dsn=os.environ['SENTRY_DSN'],
            integrations=[FlaskIntegration()],
            traces_sample_rate=0.05,    # 5% of transactions
            environment=os.environ.get('FLASK_ENV', 'production')
        )

    # CORS
    origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, origins=origins, supports_credentials=True)

    # Security headers (HTTPS only in production)
    if os.environ.get('FLASK_ENV') == 'production':
        Talisman(app, force_https=True, strict_transport_security=True,
                 content_security_policy=False)

    # Rate limiter init
    limiter.init_app(app)

    # Logger
    from middleware.logger import register_logging
    register_logging(app)

    # Register blueprints
    from routes.health import health_bp
    from routes.auth_internal import auth_bp
    from routes.analyze import analyze_bp
    from routes.history import history_bp
    from routes.payments import payments_bp
    from routes.exports import exports_bp
    from routes.carousel import carousel_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp,      url_prefix='/api')
    app.register_blueprint(analyze_bp,   url_prefix='/api')
    app.register_blueprint(history_bp,   url_prefix='/api')
    app.register_blueprint(payments_bp,  url_prefix='/api')
    app.register_blueprint(exports_bp,   url_prefix='/api')
    app.register_blueprint(carousel_bp,  url_prefix='/api')

    register_error_handlers(app)
    return app

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': str(e.description)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized'}), 401

    @app.errorhandler(PaymentRequired)
    def payment_required(e):
        return jsonify({'error': str(e.description), 'upgrade_url': '/pricing'}), 402

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({'error': 'Rate limit exceeded'}), 429

    # @app.errorhandler(500)
    # def server_error(e):
    #     return jsonify({'error': 'Internal server error'}), 500
