#!/bin/bash
# Draft2Desk Automatic Uninstaller for macOS

echo "=========================================="
echo "   Draft2Desk Word Add-in Uninstaller     "
echo "=========================================="
echo ""

# 1. Remove Manifest from WEF Folder
WEF_MANIFEST="$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef/manifest.xml"

if [ -f "$WEF_MANIFEST" ]; then
    rm -f "$WEF_MANIFEST"
    echo "[✓] Draft2Desk Manifest successfully removed from Microsoft Word WEF folder."
else
    echo "[i] Draft2Desk Manifest was not found in WEF folder."
fi

# 2. Unload and remove LaunchAgent Auto-Start Service if present
LAUNCH_AGENT="$HOME/Library/LaunchAgents/com.draft2desk.backend.plist"
if [ -f "$LAUNCH_AGENT" ]; then
    launchctl unload "$LAUNCH_AGENT" 2>/dev/null
    rm -f "$LAUNCH_AGENT"
    echo "[✓] LaunchAgent Auto-Start service removed."
fi

# 3. Stop running Draft2Desk backend server process on port 8000 safely
PID=$(lsof -ti:8000 2>/dev/null)
if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "[✓] Draft2Desk Backend Server (PID: $PID) stopped."
else
    echo "[i] No running Draft2Desk Backend Server detected."
fi

# 4. Optional Database Prompt
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"
DB_FILE="$PROJECT_DIR/draft2desk.db"

if [ -f "$DB_FILE" ]; then
    echo ""
    read -p "[?] Do you want to delete your template database (draft2desk.db)? [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$DB_FILE"
        echo "[✓] Database draft2desk.db deleted."
    else
        echo "[i] Database draft2desk.db preserved safely."
    fi
fi

echo ""
echo "=========================================="
echo " Draft2Desk uninstalled successfully!     "
echo "=========================================="
echo "You can now close this window."
