"""
run.py
------
Entry point for development and production.

Development
-----------
    python run.py

Production (Gunicorn)
---------------------
    gunicorn "run:create_app()" --bind 0.0.0.0:5000 --workers 2 --timeout 120
"""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    host  = os.getenv("HOST", "0.0.0.0")
    port  = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"

    app.run(host=host, port=port, debug=debug)
