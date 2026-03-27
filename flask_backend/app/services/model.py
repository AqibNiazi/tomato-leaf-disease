"""
services/model.py
-----------------
Owns everything related to the PyTorch model:
  - Loading weights and class metadata once at startup
  - Running inference and returning ranked predictions

The model is loaded lazily on first call to get_model() and cached for
the lifetime of the process.  This avoids reloading heavy weights on
every request.

Public API
----------
    load_model_and_metadata(config) -> None   call from app factory
    predict(pil_image, config)      -> list[dict]
    get_class_names()               -> list[str]
"""

import json
import time
from pathlib import Path
from typing import Optional

import torch
import torch.nn.functional as F
from torchvision import models, transforms

from app.utils.logger import get_logger

logger = get_logger(__name__)

# ── Module-level singletons (populated by load_model_and_metadata) ────
_model: Optional[torch.nn.Module] = None
_class_names: Optional[list] = None
_device: Optional[torch.device] = None


# ─────────────────────────────────────────────────────────────────────
# Public: initialise at startup
# ─────────────────────────────────────────────────────────────────────

def load_model_and_metadata(config) -> None:
    """
    Load ResNet50 weights and class metadata into module-level singletons.
    Call this once from the app factory — never per request.

    Raises
    ------
    FileNotFoundError  if model or metadata path does not exist
    RuntimeError       if weights are incompatible with the architecture
    """
    global _model, _class_names, _device

    model_path: Path    = config.MODEL_PATH
    metadata_path: Path = config.METADATA_PATH

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model weights not found: {model_path}\n"
            "Place tomato_disease_resnet50.pth inside the models/ directory."
        )
    if not metadata_path.exists():
        raise FileNotFoundError(
            f"Class metadata not found: {metadata_path}\n"
            "Place class_metadata.json inside the models/ directory."
        )

    # ── Device selection ──────────────────────────────────────────────
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Inference device: %s", _device)

    # ── Load class metadata ───────────────────────────────────────────
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    _class_names = metadata["class_names"]
    num_classes  = metadata["num_classes"]
    logger.info("Loaded %d disease classes from metadata", num_classes)

    # ── Rebuild model architecture ────────────────────────────────────
    # Architecture must match exactly what was used during training.
    import torch.nn as nn
    backbone = models.resnet50(weights=None)          # no pretrained download
    in_features = backbone.fc.in_features
    backbone.fc = nn.Sequential(
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.40),
        nn.Linear(512, num_classes),
    )

    # ── Load weights ──────────────────────────────────────────────────
    t0 = time.perf_counter()
    state_dict = torch.load(model_path, map_location=_device, weights_only=True)
    backbone.load_state_dict(state_dict)
    backbone.to(_device)
    backbone.eval()
    elapsed = time.perf_counter() - t0

    _model = backbone
    logger.info("Model loaded and ready in %.3f s", elapsed)


# ─────────────────────────────────────────────────────────────────────
# Public: inference
# ─────────────────────────────────────────────────────────────────────

def predict(pil_image, config) -> list[dict]:
    """
    Run inference on a single PIL image.

    Parameters
    ----------
    pil_image : PIL.Image.Image  (RGB, any size — preprocessing handled here)
    config    : Config instance  (reads IMG_SIZE, IMG_MEAN, IMG_STD, TOP_K)

    Returns
    -------
    list of dicts ordered by confidence, each containing:
        rank        : int    (1 = most confident)
        class_name  : str    (e.g. "Tomato___Early_blight")
        label       : str    (human-readable, underscores removed)
        confidence  : float  (0–100, rounded to 2 dp)
        index       : int    (class index)

    Raises
    ------
    RuntimeError  if the model has not been loaded yet
    """
    if _model is None or _class_names is None:
        raise RuntimeError(
            "Model is not loaded. Call load_model_and_metadata() from the app factory."
        )

    # ── Preprocessing ─────────────────────────────────────────────────
    preprocess = transforms.Compose([
        transforms.Resize((config.IMG_SIZE, config.IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=config.IMG_MEAN, std=config.IMG_STD),
    ])

    tensor = preprocess(pil_image).unsqueeze(0).to(_device)   # (1, 3, H, W)

    # ── Forward pass ──────────────────────────────────────────────────
    t0 = time.perf_counter()
    with torch.no_grad():
        logits    = _model(tensor)
        probs_all = F.softmax(logits, dim=1).squeeze()         # (num_classes,)

    top_k         = min(config.TOP_K, len(_class_names))
    top_probs, top_indices = torch.topk(probs_all, k=top_k)
    elapsed       = time.perf_counter() - t0
    logger.debug("Inference completed in %.3f s", elapsed)

    # ── Build result list ─────────────────────────────────────────────
    results = []
    for rank, (prob, idx) in enumerate(zip(top_probs, top_indices), start=1):
        class_name = _class_names[idx.item()]
        results.append(
            {
                "rank":       rank,
                "class_name": class_name,
                "label":      _make_label(class_name),
                "confidence": round(prob.item() * 100, 2),
                "index":      idx.item(),
            }
        )

    return results


# ─────────────────────────────────────────────────────────────────────
# Public: metadata accessors
# ─────────────────────────────────────────────────────────────────────

def get_class_names() -> list[str]:
    """Return the full list of class names in index order."""
    if _class_names is None:
        raise RuntimeError("Model metadata not loaded.")
    return _class_names


def is_model_loaded() -> bool:
    """Health-check helper — True when weights are in memory."""
    return _model is not None and _class_names is not None


# ─────────────────────────────────────────────────────────────────────
# Private helpers
# ─────────────────────────────────────────────────────────────────────

def _make_label(class_name: str) -> str:
    """
    Convert a raw class name to a clean human-readable label.

    Examples
    --------
    "Tomato___Early_blight"          →  "Early blight"
    "Tomato__Tomato_Yellow_Leaf_Curl_Virus" →  "Tomato Yellow Leaf Curl Virus"
    "Tomato___healthy"               →  "Healthy"
    """
    label = class_name
    for prefix in ("Tomato___", "Tomato__", "Tomato_"):
        if label.startswith(prefix):
            label = label[len(prefix):]
            break
    label = label.replace("_", " ").strip()
    return label.capitalize() if label else class_name
