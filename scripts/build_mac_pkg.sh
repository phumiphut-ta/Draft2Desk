#!/bin/bash
# Draft2Desk macOS Installer Package (.pkg) Builder

echo "=========================================="
echo "  Draft2Desk macOS Package Builder (.pkg) "
echo "=========================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

cd "$PROJECT_DIR"

# 1. Build Standalone PyInstaller Executable
echo "[1/3] Compiling PyInstaller Standalone Executable..."
python3 scripts/build_exe.py

# 2. Prepare PKG Payload Directory
PKG_ROOT="$PROJECT_DIR/dist/pkg_root"
mkdir -p "$PKG_ROOT/Applications/Draft2Desk"
cp -R "$PROJECT_DIR/dist/Draft2DeskServer/"* "$PKG_ROOT/Applications/Draft2Desk/"

# 3. Create LaunchAgent plist
LAUNCH_AGENT_DIR="$PKG_ROOT/Users/SHARED/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENT_DIR"

cat << 'EOF' > "$LAUNCH_AGENT_DIR/com.draft2desk.backend.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.draft2desk.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/Draft2Desk/Draft2DeskServer</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

echo "[✓] Draft2Desk Package payload ready at dist/pkg_root"
