"""
tests/test_image_service.py
---------------------------
Unit tests for app.services.image — the layer that validates and opens
uploaded images before they reach the model.
"""

import io
from unittest.mock import MagicMock

import pytest
from PIL import Image

from app.services.image import validate_and_open
from tests.conftest import make_jpeg_bytes, make_png_bytes


# ── Minimal config stub ───────────────────────────────────────────────
class _FakeConfig:
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _make_file_storage(raw_bytes: bytes, filename: str, content_type: str):
    """Build a minimal FileStorage-like object for testing."""
    from werkzeug.datastructures import FileStorage
    return FileStorage(
        stream=io.BytesIO(raw_bytes),
        filename=filename,
        content_type=content_type,
    )


# ── Happy paths ───────────────────────────────────────────────────────

def test_valid_jpeg_returns_pil_image():
    fs  = _make_file_storage(make_jpeg_bytes(), "leaf.jpg", "image/jpeg")
    img = validate_and_open(fs, _FakeConfig())
    assert isinstance(img, Image.Image)
    assert img.mode == "RGB"


def test_valid_png_returns_pil_image():
    fs  = _make_file_storage(make_png_bytes(), "leaf.png", "image/png")
    img = validate_and_open(fs, _FakeConfig())
    assert isinstance(img, Image.Image)
    assert img.mode == "RGB"


def test_image_is_always_rgb():
    """Even a palette-mode PNG must be converted to RGB."""
    buf = io.BytesIO()
    Image.new("P", (32, 32)).save(buf, format="PNG")
    fs  = _make_file_storage(buf.getvalue(), "palette.png", "image/png")
    img = validate_and_open(fs, _FakeConfig())
    assert img.mode == "RGB"


# ── Error paths ───────────────────────────────────────────────────────

def test_none_file_raises_value_error():
    with pytest.raises(ValueError, match="No image file"):
        validate_and_open(None, _FakeConfig())


def test_empty_bytes_raises_value_error():
    fs = _make_file_storage(b"", "empty.jpg", "image/jpeg")
    with pytest.raises(ValueError, match="empty"):
        validate_and_open(fs, _FakeConfig())


def test_unsupported_mime_type_raises_value_error():
    fs = _make_file_storage(make_jpeg_bytes(), "file.gif", "image/gif")
    with pytest.raises(ValueError, match="Unsupported file type"):
        validate_and_open(fs, _FakeConfig())


def test_non_image_bytes_raises_value_error():
    """A text file with an image MIME type must still be rejected."""
    fs = _make_file_storage(b"SELECT * FROM users;", "sql.jpg", "image/jpeg")
    with pytest.raises(ValueError):
        validate_and_open(fs, _FakeConfig())
