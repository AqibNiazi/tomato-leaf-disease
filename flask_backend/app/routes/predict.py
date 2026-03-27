"""
routes/predict.py
-----------------
Blueprint: predict_bp
Prefix:    /api

Endpoints
---------
POST /api/predict
    Accepts a multipart/form-data upload with an "image" field.
    Returns ranked disease predictions from the ResNet50 model.

Request
-------
    Content-Type : multipart/form-data
    Body field   : image  (JPEG | PNG | WEBP, max 8 MB)

Response 200
------------
    {
        "success": true,
        "data": {
            "predictions": [
                {
                    "rank":       1,
                    "class_name": "Tomato___Early_blight",
                    "label":      "Early blight",
                    "confidence": 94.37,
                    "index":      2
                },
                ...
            ],
            "top_prediction": { ... },    // same object as predictions[0]
            "is_healthy":     false,      // true when top class contains "healthy"
            "inference_ms":   23.4        // server-side inference time
        }
    }

Response 4xx / 5xx
-------------------
    {
        "success": false,
        "error": { "code": "...", "message": "..." }
    }
"""

import time

from flask import Blueprint, current_app, request

from app.services import image as image_service
from app.services import model as model_service
from app.utils.logger import get_logger
from app.utils.response import error_response, success_response

logger = get_logger(__name__)

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
def predict():
    """
    POST /api/predict
    Upload a leaf image and receive disease classification results.
    """
    config = current_app.config["APP_CONFIG"]

    # ── 1. Extract the uploaded file ──────────────────────────────────
    uploaded_file = request.files.get("image")
    if uploaded_file is None:
        return error_response(
            message="No 'image' field found in the request. "
                    "Send a multipart/form-data request with field name 'image'.",
            code="MISSING_IMAGE_FIELD",
            status_code=422,
        )

    # ── 2. Validate and open the image ────────────────────────────────
    try:
        pil_image = image_service.validate_and_open(uploaded_file, config)
    except ValueError as exc:
        return error_response(
            message=str(exc),
            code="INVALID_IMAGE",
            status_code=422,
        )

    # ── 3. Run inference ──────────────────────────────────────────────
    try:
        t0 = time.perf_counter()
        predictions = model_service.predict(pil_image, config)
        inference_ms = round((time.perf_counter() - t0) * 1000, 1)
    except RuntimeError as exc:
        logger.error("Model inference failed: %s", exc)
        return error_response(
            message="Inference failed. The model may not be loaded.",
            code="INFERENCE_ERROR",
            status_code=500,
        )
    except Exception as exc:
        logger.exception("Unexpected inference error: %s", exc)
        return error_response(
            message="An unexpected error occurred during inference.",
            code="INFERENCE_ERROR",
            status_code=500,
        )

    # ── 4. Build response payload ─────────────────────────────────────
    top = predictions[0] if predictions else None
    is_healthy = "healthy" in (top["class_name"].lower() if top else "")

    logger.info(
        "Prediction complete | top: %s (%.1f%%) | %.1f ms",
        top["label"] if top else "N/A",
        top["confidence"] if top else 0.0,
        inference_ms,
    )

    return success_response(
        {
            "predictions":   predictions,
            "top_prediction": top,
            "is_healthy":    is_healthy,
            "inference_ms":  inference_ms,
        }
    )
