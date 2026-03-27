"""
tests/test_classes.py
---------------------
Tests for GET /api/classes
"""

from unittest.mock import patch
from tests.conftest import FAKE_CLASSES


def test_classes_returns_200(client):
    """GET /api/classes should return 200 with a classes list."""
    with patch("app.services.model.is_model_loaded", return_value=True), \
         patch("app.services.model.get_class_names", return_value=FAKE_CLASSES):

        resp = client.get("/api/classes")
        assert resp.status_code == 200

        body = resp.get_json()
        assert body["success"] is True
        assert "classes" in body["data"]
        assert "total"   in body["data"]
        assert body["data"]["total"] == len(FAKE_CLASSES)


def test_classes_each_entry_has_required_fields(client):
    """Each class entry should have index, class_name, and label."""
    with patch("app.services.model.is_model_loaded", return_value=True), \
         patch("app.services.model.get_class_names", return_value=FAKE_CLASSES):

        resp = client.get("/api/classes")
        for entry in resp.get_json()["data"]["classes"]:
            assert "index"      in entry
            assert "class_name" in entry
            assert "label"      in entry


def test_classes_returns_503_when_model_not_loaded(client):
    """Should return 503 if model metadata is not available."""
    with patch("app.services.model.is_model_loaded", return_value=False):
        resp = client.get("/api/classes")
        assert resp.status_code == 503
        assert resp.get_json()["error"]["code"] == "MODEL_NOT_READY"


def test_classes_rejects_post(client):
    """Only GET is allowed."""
    resp = client.post("/api/classes")
    assert resp.status_code == 405
