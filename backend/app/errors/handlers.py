"""
errors/handlers.py
------------------
Registers Flask error handlers so every HTTP error — whether raised by
application code or Flask itself — returns a consistent JSON envelope
instead of the default HTML error page.

Register by calling register_error_handlers(app) from the app factory.
"""

from flask import Flask, jsonify
from werkzeug.exceptions import (
    RequestEntityTooLarge,
    UnsupportedMediaType,
    UnprocessableEntity,
    NotFound,
    MethodNotAllowed,
)

from app.utils.logger import get_logger

logger = get_logger(__name__)


def _make_error(code: str, message: str, status: int):
    response = jsonify({"success": False, "error": {"code": code, "message": message}})
    response.status_code = status
    return response


def register_error_handlers(app: Flask) -> None:
    """Attach all error handlers to *app*."""

    @app.errorhandler(400)
    def bad_request(exc):
        return _make_error("BAD_REQUEST", "The request was malformed.", 400)

    @app.errorhandler(404)
    @app.errorhandler(NotFound)
    def not_found(exc):
        return _make_error("NOT_FOUND", "The requested endpoint does not exist.", 404)

    @app.errorhandler(405)
    @app.errorhandler(MethodNotAllowed)
    def method_not_allowed(exc):
        return _make_error(
            "METHOD_NOT_ALLOWED",
            "This HTTP method is not allowed on this endpoint.",
            405,
        )

    @app.errorhandler(413)
    @app.errorhandler(RequestEntityTooLarge)
    def file_too_large(exc):
        mb = app.config.get("MAX_CONTENT_LENGTH", 8 * 1024 * 1024) // (1024 * 1024)
        return _make_error(
            "FILE_TOO_LARGE",
            f"Upload exceeds the {mb} MB limit. Please send a smaller image.",
            413,
        )

    @app.errorhandler(415)
    @app.errorhandler(UnsupportedMediaType)
    def unsupported_media_type(exc):
        return _make_error(
            "UNSUPPORTED_MEDIA_TYPE",
            "Use multipart/form-data with an 'image' field.",
            415,
        )

    @app.errorhandler(422)
    @app.errorhandler(UnprocessableEntity)
    def unprocessable(exc):
        return _make_error(
            "UNPROCESSABLE_ENTITY",
            "The request could not be processed. Check the image field.",
            422,
        )

    @app.errorhandler(500)
    def internal_error(exc):
        logger.exception("Unhandled server error: %s", exc)
        return _make_error(
            "INTERNAL_ERROR",
            "An unexpected server error occurred. Please try again.",
            500,
        )
