"""
run.py — works as BOTH:
  • gunicorn run:app       (Render production)
  • python run.py          (local development)

The sys.path fix MUST happen before any local imports.
"""
import os
import sys
from pathlib import Path

# ── 1. Fix sys.path FIRST so 'api' package is importable ─────────────────────
ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# ── 2. Load .env (local dev only — Render sets vars via dashboard) ────────────
try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env", override=False)
except ImportError:
    pass  # dotenv not installed on Render; env vars come from the dashboard

# ── 3. Import Flask app (gunicorn uses this `app` variable) ──────────────────
from api.index import app  # noqa: E402

# ── 4. Local dev runner ───────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[run.py] Open → http://localhost:{port}")
    print(f"[run.py] IBM_API_KEY    : {'✓ set' if os.environ.get('IBM_API_KEY') else '✗ not set (demo mode)'}")
    print(f"[run.py] IBM_PROJECT_ID : {'✓ set' if os.environ.get('IBM_PROJECT_ID') else '✗ not set (demo mode)'}")
    app.run(host="0.0.0.0", port=port, debug=False)
