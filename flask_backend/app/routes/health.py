"""
routes/health.py
----------------
Blueprint: health_bp
Prefix:    /api

Endpoints
---------
GET /api/health
    Returns the current operational status of the API.
    Used by React to verify the backend is reachable and the model is loaded.

Response 200 — model ready
--------------------------
    {
        "success": true,
        "data": {
            "status":       "ok",
            "model_loaded": true,
            "num_classes":  10,
            "device":       "cuda"
        }
    }

Response 503 — model not loaded yet
------------------------------------
    {
        "success": false,
        "error": {
            "code":    "MODEL_NOT_READY",
            "message": "The model is still loading. Please retry in a moment."
        }
    }
"""

import torch
from flask import Blueprint

from app.services import model as model_service
from app.utils.response import error_response, success_response

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """GET /api/health — liveness + readiness probe."""
    if not model_service.is_model_loaded():
        return error_response(
            message="The model is still loading. Please retry in a moment.",
            code="MODEL_NOT_READY",
            status_code=503,
        )

    class_names = model_service.get_class_names()
    device      = "cuda" if torch.cuda.is_available() else "cpu"

    return success_response(
        {
            "status":       "ok",
            "model_loaded": True,
            "num_classes":  len(class_names),
            "device":       device,
        }
    )
