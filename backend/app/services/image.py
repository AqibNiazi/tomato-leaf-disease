"""
services/image.py
-----------------
Handles everything between receiving a raw file upload and handing a
clean PIL Image to the model service.

Responsibilities
----------------
1. Validate the file object is present and non-empty
2. Verify the MIME type is on the allow-list
3. Verify the actual file magic bytes match a supported format
   (guards against extension spoofing)
4. Open the image with Pillow and convert to RGB
5. Return the PIL Image ready for inference

Public API
----------
    validate_and_open(file_storage, config) -> PIL.Image.Image
"""

# import imghdr
# import io
# from typing import Any

# from PIL import Image, UnidentifiedImageError
# from werkzeug.datastructures import FileStorage

# from app.utils.logger import get_logger

# logger = get_logger(__name__)

# # Imghdr type strings that correspond to our allowed MIME types
# _ALLOWED_IMGHDR_TYPES = {"jpeg", "png", "webp"}


# def validate_and_open(file_storage: FileStorage, config: Any) -> Image.Image:
#     """
#     Validate *file_storage* and return an RGB PIL Image.

#     Parameters
#     ----------
#     file_storage : werkzeug.datastructures.FileStorage
#         The uploaded file from request.files["image"].
#     config : Config
#         Application config (reads ALLOWED_MIME_TYPES).

#     Returns
#     -------
#     PIL.Image.Image  (mode "RGB", any size)

#     Raises
#     ------
#     ValueError  with a descriptive message for every validation failure.
#                 Callers should map this to a 422 response.
#     """
#     # ── 1. File must be present and have a filename ───────────────────
#     if file_storage is None or file_storage.filename == "":
#         raise ValueError("No image file was included in the request.")

#     # ── 2. Read the raw bytes ─────────────────────────────────────────
#     raw_bytes: bytes = file_storage.read()

#     if len(raw_bytes) == 0:
#         raise ValueError("The uploaded file is empty.")

#     # ── 3. MIME type check (reported by the browser / curl) ───────────
#     content_type = (file_storage.content_type or "").split(";")[0].strip().lower()
#     if content_type and content_type not in config.ALLOWED_MIME_TYPES:
#         raise ValueError(
#             f"Unsupported file type '{content_type}'. "
#             "Please upload a JPEG, PNG, or WEBP image."
#         )

#     # ── 4. Magic-byte check (actual file content) ─────────────────────
#     detected = imghdr.what(None, h=raw_bytes[:32])
#     if detected not in _ALLOWED_IMGHDR_TYPES:
#         raise ValueError(
#             "The file content does not match a supported image format. "
#             "Please upload a real JPEG, PNG, or WEBP image."
#         )

#     # ── 5. Open with Pillow ───────────────────────────────────────────
#     try:
#         image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
#     except UnidentifiedImageError:
#         raise ValueError("Pillow could not decode the uploaded file as an image.")
#     except Exception as exc:
#         logger.warning("Unexpected Pillow error: %s", exc)
#         raise ValueError("Failed to open the uploaded image. The file may be corrupted.")

#     logger.debug(
#         "Image opened — size: %dx%d, mode: %s, format: %s",
#         image.width, image.height, image.mode, image.format,
#     )
#     return image


import io
from typing import Any

from PIL import Image, UnidentifiedImageError
from werkzeug.datastructures import FileStorage

from app.utils.logger import get_logger

logger = get_logger(__name__)

# Standardized format names returned by Pillow (Image.format)
_ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

def validate_and_open(file_storage: FileStorage, config: Any) -> Image.Image:
    """
    Validate *file_storage* and return an RGB PIL Image.
    """
    # ── 1. File must be present and have a filename ───────────────────
    if file_storage is None or file_storage.filename == "":
        raise ValueError("No image file was included in the request.")

    # ── 2. Read the raw bytes ─────────────────────────────────────────
    raw_bytes: bytes = file_storage.read()

    if len(raw_bytes) == 0:
        raise ValueError("The uploaded file is empty.")

    # ── 3. MIME type check (reported by the browser) ──────────────────
    content_type = (file_storage.content_type or "").split(";")[0].strip().lower()
    if content_type and content_type not in config.ALLOWED_MIME_TYPES:
        raise ValueError(
            f"Unsupported file type '{content_type}'. "
            "Please upload a JPEG, PNG, or WEBP image."
        )

    # ── 4. Verify Content (Replacing imghdr with Pillow's verify) ─────
    try:
        # We wrap in BytesIO so we don't lose the pointer
        stream = io.BytesIO(raw_bytes)
        with Image.open(stream) as img:
            # Check if the detected format is in our allow-list
            if img.format not in _ALLOWED_FORMATS:
                raise ValueError(
                    f"The file format '{img.format}' is not supported. "
                    "Please upload a real JPEG, PNG, or WEBP image."
                )
            
            # This triggers a deeper check of the file headers
            img.verify() 
            
        # Re-open for actual processing (verify() closes the file pointer)
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        
    except (UnidentifiedImageError, ValueError) as exc:
        logger.warning("Validation failed: %s", exc)
        raise ValueError("The file content does not match a supported image format.")
    except Exception as exc:
        logger.error("Unexpected error during image validation: %s", exc)
        raise ValueError("Failed to process the uploaded image.")

    logger.debug(
        "Image opened — size: %dx%d, mode: %s, format: %s",
        image.width, image.height, image.mode, image.format,
    )
    return image