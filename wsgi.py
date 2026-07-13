"""
wsgi.py — Gunicorn / Render entry point for TravelGPT.

Gunicorn command:  gunicorn wsgi:app
This file lives at the project root so gunicorn can find it without
any sys.path tricks.
"""
import os
import sys
from pathlib import Path

# ── Load .env when running locally (python-dotenv) ───────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env", override=False)
except ImportError:
    pass  # python-dotenv not installed — env vars already set by the platform

# ── Ensure api/ is importable as a package ───────────────────────────────────
ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))  # adds project root so "api.X" works

# ── Import the Flask app ─────────────────────────────────────────────────────
from api.index import app  # noqa: E402  (must come after sys.path setup)

if __name__ == "__main__":
    # Development only — Render/Gunicorn never runs this block
    port = int(os.environ.get("PORT", 5000))
    print(f"[wsgi] Dev server → http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
