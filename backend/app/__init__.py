"""
app/__init__.py
---------------
Application factory.

Usage
-----
    from app import create_app
    app = create_app()

The factory pattern (instead of a module-level app object) lets us
create isolated instances for testing and allows deferred model loading.
"""

from flask import Flask
from flask_cors import CORS

from config import get_config
from app.utils.logger import get_logger, setup_logging
from app.errors.handlers import register_error_handlers


def create_app() -> Flask:
    """
    Create, configure, and return the Flask application instance.

    Steps
    -----
    1. Instantiate Flask
    2. Load configuration
    3. Set up logging
    4. Configure CORS
    5. Load model weights (once — not per request)
    6. Register blueprints
    7. Register error handlers
    """
    app = Flask(__name__)

    # ── 1. Configuration ──────────────────────────────────────────────
    config = get_config()
    app.config.from_object(config)
    # Store the config object directly so routes can do:
    #   config = current_app.config["APP_CONFIG"]
    app.config["APP_CONFIG"] = config

    # ── 2. Logging ────────────────────────────────────────────────────
    setup_logging(log_dir=config.LOG_DIR, level=config.LOG_LEVEL)
    logger = get_logger(__name__)
    logger.info("Starting Tomato Disease API  [env=%s]", type(config).__name__)

    # ── 3. CORS ───────────────────────────────────────────────────────
    CORS(
        app,
        resources={r"/api/*": {"origins": config.CORS_ORIGINS}},
        supports_credentials=False,
    )
    logger.debug("CORS origins: %s", config.CORS_ORIGINS)

    # ── 4. Load model (fail fast — better to crash at startup than on first request)
    from app.services.model import load_model_and_metadata
    try:
        load_model_and_metadata(config)
    except FileNotFoundError as exc:
        logger.critical("Cannot start: %s", exc)
        raise SystemExit(1) from exc

    # ── 5. Register blueprints ────────────────────────────────────────
    _register_blueprints(app)
    logger.info("Blueprints registered")

    # ── 6. Register error handlers ────────────────────────────────────
    register_error_handlers(app)

    logger.info("Application ready")
    return app


def _register_blueprints(app: Flask) -> None:
    """Import and register every blueprint under /api."""
    from app.routes.predict import predict_bp
    from app.routes.health  import health_bp
    from app.routes.classes import classes_bp

    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(health_bp,  url_prefix="/api")
    app.register_blueprint(classes_bp, url_prefix="/api")
