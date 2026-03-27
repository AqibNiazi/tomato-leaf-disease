"""
utils/response.py
-----------------
Centralised JSON response builders.

Every route returns either success_response() or error_response() so
the React frontend always receives a predictable envelope:

    Success:
    {
        "success": true,
        "data":    { ... }
    }

    Error:
    {
        "success": false,
        "error": {
            "code":    "UNSUPPORTED_FILE_TYPE",
            "message": "Only JPEG, PNG and WEBP images are accepted."
        }
    }
"""

from flask import jsonify
from typing import Any


def success_response(data: Any, status_code: int = 200):
    """
    Wrap *data* in a standard success envelope.

    Parameters
    ----------
    data : any JSON-serialisable value
    status_code : int  (default 200)
    """
    return jsonify({"success": True, "data": data}), status_code


def error_response(message: str, code: str = "INTERNAL_ERROR", status_code: int = 500):
    """
    Wrap an error message in a standard error envelope.

    Parameters
    ----------
    message    : str  — human-readable description shown to the user
    code       : str  — machine-readable error code for the frontend
    status_code: int  — HTTP status code
    """
    return (
        jsonify(
            {
                "success": False,
                "error": {
                    "code":    code,
                    "message": message,
                },
            }
        ),
        status_code,
    )
