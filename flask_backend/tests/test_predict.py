"""
tests/test_predict.py
---------------------
Tests for POST /api/predict
"""

import io


# ── Happy path ────────────────────────────────────────────────────────

def test_predict_jpeg_returns_200(client, mock_predict, jpeg_upload):
    """A valid JPEG upload should return 200 with predictions."""
    filename, file_bytes, content_type = jpeg_upload
    resp = client.post(
        "/api/predict",
        data={"image": (file_bytes, filename, content_type)},
        content_type="multipart/form-data",
    )
    assert resp.status_code == 200

    body = resp.get_json()
    assert body["success"] is True

    data = body["data"]
    assert "predictions"    in data
    assert "top_prediction" in data
    assert "is_healthy"     in data
    assert "inference_ms"   in data
    assert isinstance(data["predictions"], list)
    assert len(data["predictions"]) > 0


def test_predict_png_returns_200(client, mock_predict, png_upload):
    """A valid PNG upload should also return 200."""
    filename, file_bytes, content_type = png_upload
    resp = client.post(
        "/api/predict",
        data={"image": (file_bytes, filename, content_type)},
        content_type="multipart/form-data",
    )
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


def test_predict_top_prediction_is_highest_confidence(client, mock_predict, jpeg_upload):
    """top_prediction should match predictions[0] (highest confidence)."""
    filename, file_bytes, content_type = jpeg_upload
    resp = client.post(
        "/api/predict",
        data={"image": (file_bytes, filename, content_type)},
        content_type="multipart/form-data",
    )
    data = resp.get_json()["data"]
    assert data["top_prediction"]["rank"] == 1
    assert data["top_prediction"] == data["predictions"][0]


def test_predict_is_healthy_false_for_disease(client, mock_predict, jpeg_upload):
    """is_healthy should be False when the top prediction is a disease."""
    filename, file_bytes, content_type = jpeg_upload
    resp = client.post(
        "/api/predict",
        data={"image": (file_bytes, filename, content_type)},
        content_type="multipart/form-data",
    )
    # mock_predict returns Early_blight as top — not healthy
    assert resp.get_json()["data"]["is_healthy"] is False


def test_predict_prediction_fields_present(client, mock_predict, jpeg_upload):
    """Each prediction dict must have the expected keys."""
    filename, file_bytes, content_type = jpeg_upload
    resp = client.post(
        "/api/predict",
        data={"image": (file_bytes, filename, content_type)},
        content_type="multipart/form-data",
    )
    for pred in resp.get_json()["data"]["predictions"]:
        assert "rank"       in pred
        assert "class_name" in pred
        assert "label"      in pred
        assert "confidence" in pred
        assert "index"      in pred


# ── Validation errors ─────────────────────────────────────────────────

def test_predict_missing_image_field_returns_422(client, mock_predict):
    """Request without an 'image' field should return 422."""
    resp = client.post("/api/predict", data={}, content_type="multipart/form-data")
    assert resp.status_code == 422

    body = resp.get_json()
    assert body["success"] is False
    assert body["error"]["code"] == "MISSING_IMAGE_FIELD"


def test_predict_empty_file_returns_422(client, mock_predict):
    """An empty file should be rejected with 422."""
    resp = client.post(
        "/api/predict",
        data={"image": (io.BytesIO(b""), "empty.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert resp.status_code == 422
    assert resp.get_json()["success"] is False


def test_predict_text_file_returns_422(client, mock_predict):
    """A plain-text file masquerading as an image should be rejected."""
    resp = client.post(
        "/api/predict",
        data={"image": (io.BytesIO(b"not an image at all"), "fake.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert resp.status_code == 422
    assert resp.get_json()["success"] is False


def test_predict_rejects_get(client):
    """Only POST is allowed on /api/predict."""
    resp = client.get("/api/predict")
    assert resp.status_code == 405
