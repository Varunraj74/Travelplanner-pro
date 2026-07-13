"""
Local development runner for TravelGPT.
Run from the project root:  python run.py
"""
import os
import sys
from pathlib import Path

# ── Load .env from project root ──────────────────────────────
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            # Strip surrounding quotes if present
            val = val.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), val)
    print(f"[run.py] Loaded .env")
else:
    print("[run.py] No .env found — using existing environment variables")

# ── Add api/ to path and import app ─────────────────────────
api_dir = Path(__file__).parent / "api"
sys.path.insert(0, str(api_dir))

from index import app  # noqa: E402

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Use 0.0.0.0 so Flask listens on all interfaces.
    # Always open via http://localhost:<port> — NOT http://127.0.0.1:<port>
    # Chrome blocks direct IP access (Private Network Access policy → 403).
    print(f"[run.py] Starting TravelGPT on http://localhost:{port}")
    print(f"[run.py] IBM_API_KEY set    : {'yes' if os.environ.get('IBM_API_KEY') else 'NO — demo mode'}")
    print(f"[run.py] IBM_PROJECT_ID set : {'yes' if os.environ.get('IBM_PROJECT_ID') else 'NO — demo mode'}")
    app.run(host="0.0.0.0", port=port, debug=True)
