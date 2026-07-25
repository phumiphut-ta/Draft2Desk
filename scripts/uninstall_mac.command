#!/bin/bash
# Draft2Desk Automatic Uninstaller for macOS

echo "=========================================="
echo "   Draft2Desk Word Add-in Uninstaller     "
echo "=========================================="
echo ""

WEF_MANIFEST="$HOME/Library/Containers/com.microsoft.Word/Data/Documents/wef/manifest.xml"

if [ -f "$WEF_MANIFEST" ]; then
    rm -f "$WEF_MANIFEST"
    echo "[✓] Draft2Desk Manifest successfully removed from Microsoft Word WEF folder."
else
    echo "[i] Draft2Desk Manifest was not found in WEF folder."
fi

# Kill running uvicorn backend server if any
pkill -f "uvicorn backend.main:app" > /dev/null 2>&1
echo "[✓] Draft2Desk Backend Server process stopped."

echo ""
echo "Draft2Desk has been uninstalled successfully from Microsoft Word!"
echo "You can now close this window."
