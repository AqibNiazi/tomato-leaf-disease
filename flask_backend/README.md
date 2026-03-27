# Tomato Disease API — Flask Backend

REST API that classifies tomato leaf diseases using a fine-tuned ResNet50 model.

## Project structure

```
flask_backend/
├── app/
│   ├── __init__.py          # Application factory
│   ├── routes/
│   │   ├── predict.py       # POST /api/predict
│   │   ├── health.py        # GET  /api/health
│   │   └── classes.py       # GET  /api/classes
│   ├── services/
│   │   ├── model.py         # Model loading + inference
│   │   └── image.py         # Upload validation + PIL opening
│   ├── utils/
│   │   ├── logger.py        # Rotating file + console logger
│   │   └── response.py      # JSON envelope helpers
│   └── errors/
│       └── handlers.py      # Global JSON error handlers
├── models/
│   ├── tomato_disease_resnet50.pth   ← place here (not in git)
│   └── class_metadata.json          ← place here (not in git)
├── tests/
│   ├── conftest.py
│   ├── test_health.py
│   ├── test_predict.py
│   ├── test_classes.py
│   └── test_image_service.py
├── logs/                    # auto-created on first run
├── config.py
├── run.py
├── requirements.txt
└── .env.example
```

## Quick start

### 1. Place your model files

```
models/tomato_disease_resnet50.pth
models/class_metadata.json
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env if your paths or ports differ
```

### 4. Run the development server

```bash
python run.py
```

The API will be available at `http://localhost:5000`.

---

## API endpoints

### `GET /api/health`

Liveness and readiness check.

**Response 200**
```json
{
  "success": true,
  "data": {
    "status":       "ok",
    "model_loaded": true,
    "num_classes":  10,
    "device":       "cpu"
  }
}
```

---

### `GET /api/classes`

Returns all disease classes the model can predict.

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "classes": [
      { "index": 0, "class_name": "Tomato___Bacterial_spot", "label": "Bacterial spot" },
      ...
    ]
  }
}
```

---

### `POST /api/predict`

Upload a leaf image and receive ranked disease predictions.

**Request**
```
Content-Type: multipart/form-data
Field:        image  (JPEG | PNG | WEBP, max 8 MB)
```

**curl example**
```bash
curl -X POST http://localhost:5000/api/predict \
     -F "image=@/path/to/leaf.jpg"
```

**Response 200**
```json
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
      }
    ],
    "top_prediction": { ... },
    "is_healthy":    false,
    "inference_ms":  23.4
  }
}
```

**Error response shape (all 4xx/5xx)**
```json
{
  "success": false,
  "error": {
    "code":    "INVALID_IMAGE",
    "message": "Pillow could not decode the uploaded file as an image."
  }
}
```

---

## Running tests

```bash
pip install pytest
pytest tests/ -v
```

---

## Production deployment (Gunicorn)

```bash
gunicorn "run:create_app()" \
    --bind 0.0.0.0:5000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile logs/access.log
```

Use `--workers 1` if loading the PyTorch model into multiple worker
processes exceeds your available RAM. Each worker loads its own copy
of the weights.
