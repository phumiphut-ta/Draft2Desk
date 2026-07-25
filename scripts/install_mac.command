#!/bin/bash
# Draft2Desk Automatic Installer for macOS

echo "=========================================="
echo "    Draft2Desk Word Add-in Installer      "
echo "=========================================="
echo ""

# 1. Copy Manifest to Microsoft Word WEF Folder
WEF_DIR="$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef"
mkdir -p "$WEF_DIR"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

if [ -f "$PROJECT_DIR/manifest.xml" ]; then
    cp "$PROJECT_DIR/manifest.xml" "$WEF_DIR/manifest.xml"
    echo "[✓] Manifest successfully installed to Microsoft Word WEF folder."
else
    echo "[X] Error: manifest.xml not found in $PROJECT_DIR"
    exit 1
fi

# 2. Check Python virtual environment and run server
echo "[i] Starting Draft2Desk Backend Server..."
cd "$PROJECT_DIR"

if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

python3 -m pip install -q -r backend/requirements.txt
echo "[✓] Dependencies updated."
echo "[✓] Launching Server on http://127.0.0.1:8000"
echo ""
echo "Open Microsoft Word -> Insert -> Add-ins to use Draft2Desk!"
echo "Press Ctrl+C to stop server."

python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
