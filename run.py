"""
Local development runner for TravelGPT.
Usage:  python run.py
"""
import os
import sys
from pathlib import Path

# Load .env from project root
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env", override=False)
    print("[run.py] .env loaded")
except ImportError:
    print("[run.py] python-dotenv not found — using existing env vars")

# Add api/ to path and import app
sys.path.insert(0, str(Path(__file__).parent))
from api.index import app  # noqa: E402

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[run.py] Open → http://localhost:{port}")
    print(f"[run.py] IBM_API_KEY    : {'✓ set' if os.environ.get('IBM_API_KEY') else '✗ not set (demo mode)'}")
    print(f"[run.py] IBM_PROJECT_ID : {'✓ set' if os.environ.get('IBM_PROJECT_ID') else '✗ not set (demo mode)'}")
    # Never run debug=True in production
    app.run(host="0.0.0.0", port=port, debug=False)
