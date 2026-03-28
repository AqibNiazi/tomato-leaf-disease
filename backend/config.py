"""
config.py
---------
Central configuration for every environment.
All values are read from environment variables (with safe defaults).
Import Config wherever you need a setting — never read os.environ
directly from routes or services.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file when present (ignored in production if not present)
load_dotenv()

# ── Project root ───────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent


class Config:
    """Base configuration shared across all environments."""

    # Project root (alias to module-level BASE_DIR)
    BASE_DIR: Path = BASE_DIR

    # Flask core
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    DEBUG: bool = False
    TESTING: bool = False

    # Upload limits
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", 8)) * 1024 * 1024

    # Allowed image MIME types
    ALLOWED_MIME_TYPES: set = {"image/jpeg", "image/png", "image/webp"}

    # Model artefacts
    MODEL_PATH: Path = BASE_DIR / os.getenv("MODEL_PATH", "models/tomato_disease_resnet50.pth")
    METADATA_PATH: Path = BASE_DIR / os.getenv("METADATA_PATH", "models/class_metadata.json")

    # Inference settings
    TOP_K: int = int(os.getenv("TOP_K", 5))
    IMG_SIZE: int = int(os.getenv("IMG_SIZE", 224))

    # ImageNet normalisation — must match training
    IMG_MEAN: list = [0.485, 0.456, 0.406]
    IMG_STD: list  = [0.229, 0.224, 0.225]

    # CORS
    CORS_ORIGINS: list = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]

    # Logging
    LOG_DIR: Path = BASE_DIR / "logs"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


class DevelopmentConfig(Config):
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"


class ProductionConfig(Config):
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"


class TestingConfig(Config):
    TESTING: bool = True
    DEBUG: bool = True
    # Use a tiny fake model path so tests don't need real weights
    MODEL_PATH: Path = Config.BASE_DIR / "tests/fixtures/fake_model.pth"
    METADATA_PATH: Path = Config.BASE_DIR / "tests/fixtures/fake_metadata.json"


# Map FLASK_ENV → config class
_CONFIG_MAP: dict = {
    "development": DevelopmentConfig,
    "production":  ProductionConfig,
    "testing":     TestingConfig,
}


def get_config() -> Config:
    """Return the correct Config class for the current FLASK_ENV."""
    env = os.getenv("FLASK_ENV", "development").lower()
    return _CONFIG_MAP.get(env, DevelopmentConfig)()
