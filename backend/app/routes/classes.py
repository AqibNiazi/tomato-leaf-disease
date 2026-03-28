"""
routes/classes.py
-----------------
Blueprint: classes_bp
Prefix:    /api

Endpoints
---------
GET /api/classes
    Returns the full list of disease class names that the model
    can predict.  The React frontend uses this to build labels,
    filter dropdowns, and result cards without hardcoding strings.

Response 200
------------
    {
        "success": true,
        "data": {
            "classes": [
                {
                    "index":      0,
                    "class_name": "Tomato___Bacterial_spot",
                    "label":      "Bacterial spot"
                },
                ...
            ],
            "total": 10
        }
    }
"""

from flask import Blueprint

from app.services import model as model_service
from app.utils.response import error_response, success_response

classes_bp = Blueprint("classes", __name__)


@classes_bp.route("/classes", methods=["GET"])
def get_classes():
    """GET /api/classes — return all disease classes with human-readable labels."""
    if not model_service.is_model_loaded():
        return error_response(
            message="Model metadata is not available yet.",
            code="MODEL_NOT_READY",
            status_code=503,
        )

    class_names = model_service.get_class_names()

    classes = [
        {
            "index":      idx,
            "class_name": name,
            "label":      model_service._make_label(name),
        }
        for idx, name in enumerate(class_names)
    ]

    return success_response({"classes": classes, "total": len(classes)})
