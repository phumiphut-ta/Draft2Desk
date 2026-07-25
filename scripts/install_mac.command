#!/bin/bash
# Draft2Desk Automatic Installer for macOS

echo "=========================================="
echo "    Draft2Desk Word Add-in Installer      "
echo "=========================================="
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

# 1. Copy Manifest to Microsoft Word WEF Folder safely
WEF_DIR="$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef"
mkdir -p "$WEF_DIR"

if [ -f "$PROJECT_DIR/manifest.xml" ]; then
    cp "$PROJECT_DIR/manifest.xml" "$WEF_DIR/manifest.xml"
    echo "[✓] Manifest successfully installed to Microsoft Word WEF folder."
else
    echo "[X] Error: manifest.xml not found in $PROJECT_DIR"
    exit 1
fi

# 2. Manage isolated Virtual Environment (.venv) safely
cd "$PROJECT_DIR"

if [ ! -d ".venv" ]; then
    echo "[i] Creating isolated virtual environment (.venv)..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "[i] Checking and updating Python dependencies..."
pip install -q -r backend/requirements.txt
echo "[✓] Dependencies ready."

# 3. Launch Backend Server safely
echo "[✓] Launching Draft2Desk Server on http://127.0.0.1:8000"
echo ""
echo "--------------------------------------------------------"
echo " Open Microsoft Word -> Insert -> Add-ins -> Draft2Desk "
echo "--------------------------------------------------------"
echo "Press Ctrl+C to stop the server."
echo ""

python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
