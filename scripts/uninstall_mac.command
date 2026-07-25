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

# 2. Stop running Draft2Desk backend server process on port 8000 safely
PID=$(lsof -ti:8000 2>/dev/null)
if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "[✓] Draft2Desk Backend Server (PID: $PID) stopped."
else
    echo "[i] No running Draft2Desk Backend Server detected."
fi

echo ""
echo "=========================================="
echo " Draft2Desk uninstalled successfully!     "
echo "=========================================="
echo "You can now close this window."
