"""
tests/test_health.py
--------------------
Tests for GET /api/health
"""

from unittest.mock import patch


def test_health_returns_200_when_model_loaded(client):
    """Health endpoint should return 200 and status 'ok' when model is ready."""
    with patch("app.services.model.is_model_loaded", return_value=True), \
         patch("app.services.model.get_class_names", return_value=["A", "B", "C"]):

        resp = client.get("/api/health")
        assert resp.status_code == 200

        body = resp.get_json()
        assert body["success"] is True
        assert body["data"]["status"] == "ok"
        assert body["data"]["model_loaded"] is True
        assert body["data"]["num_classes"] == 3


def test_health_returns_503_when_model_not_loaded(client):
    """Health endpoint should return 503 when model has not been loaded yet."""
    with patch("app.services.model.is_model_loaded", return_value=False):
        resp = client.get("/api/health")
        assert resp.status_code == 503

        body = resp.get_json()
        assert body["success"] is False
        assert body["error"]["code"] == "MODEL_NOT_READY"


def test_health_rejects_post(client):
    """Only GET is allowed on /api/health."""
    resp = client.post("/api/health")
    assert resp.status_code == 405
