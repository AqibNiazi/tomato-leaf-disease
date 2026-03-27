"""
tests/conftest.py
-----------------
Shared pytest fixtures.

The key challenge in testing this app is that create_app() calls
load_model_and_metadata() which needs real .pth weights.  We solve
this by monkeypatching the model service before the factory runs so
tests never need the actual 100 MB weights file.
"""

import io
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

# ── Fake class metadata ───────────────────────────────────────────────
FAKE_CLASSES = [
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___healthy",
]

FAKE_METADATA = {
    "class_names":  FAKE_CLASSES,
    "class_to_idx": {c: i for i, c in enumerate(FAKE_CLASSES)},
    "idx_to_class": {str(i): c for i, c in enumerate(FAKE_CLASSES)},
    "num_classes":  len(FAKE_CLASSES),
    "img_size":     224,
    "mean":         [0.485, 0.456, 0.406],
    "std":          [0.229, 0.224, 0.225],
}

# ── Fake prediction result ────────────────────────────────────────────
FAKE_PREDICTIONS = [
    {
        "rank":       1,
        "class_name": "Tomato___Early_blight",
        "label":      "Early blight",
        "confidence": 91.50,
        "index":      1,
    },
    {
        "rank":       2,
        "class_name": "Tomato___Bacterial_spot",
        "label":      "Bacterial spot",
        "confidence": 6.30,
        "index":      0,
    },
    {
        "rank":       3,
        "class_name": "Tomato___healthy",
        "label":      "Healthy",
        "confidence": 2.20,
        "index":      2,
    },
]


@pytest.fixture(scope="session")
def app():
    """
    Create a test Flask application with the model service fully mocked.
    Session-scoped — the app is created once for the entire test run.
    """
    # Patch load_model_and_metadata so no real weights are needed
    with patch("app.services.model.load_model_and_metadata") as mock_load, \
         patch("app.services.model._model",        new=MagicMock()), \
         patch("app.services.model._class_names",  new=FAKE_CLASSES), \
         patch("app.services.model._device",       new="cpu"):

        mock_load.return_value = None   # do nothing

        import os
        os.environ["FLASK_ENV"] = "testing"

        from app import create_app
        flask_app = create_app()
        flask_app.config["TESTING"] = True

        yield flask_app


@pytest.fixture()
def client(app):
    """Flask test client — function-scoped so each test gets a clean slate."""
    return app.test_client()


@pytest.fixture()
def mock_predict(monkeypatch):
    """
    Replace model_service.predict with a function that returns FAKE_PREDICTIONS.
    Use this fixture in any test that exercises the /api/predict endpoint.
    """
    from app.services import model as model_service

    def _fake_predict(pil_image, config):
        return FAKE_PREDICTIONS

    monkeypatch.setattr(model_service, "predict", _fake_predict)
    monkeypatch.setattr(model_service, "is_model_loaded", lambda: True)
    return FAKE_PREDICTIONS


# ── Image helpers ─────────────────────────────────────────────────────

def make_jpeg_bytes(width: int = 64, height: int = 64) -> bytes:
    """Return raw JPEG bytes for a solid-green test image."""
    buf = io.BytesIO()
    Image.new("RGB", (width, height), color=(0, 180, 0)).save(buf, format="JPEG")
    return buf.getvalue()


def make_png_bytes(width: int = 64, height: int = 64) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (width, height), color=(0, 180, 0)).save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture()
def jpeg_upload():
    """A (filename, bytes_io, content_type) tuple ready for test_client.post."""
    return ("leaf.jpg", io.BytesIO(make_jpeg_bytes()), "image/jpeg")


@pytest.fixture()
def png_upload():
    return ("leaf.png", io.BytesIO(make_png_bytes()), "image/png")
