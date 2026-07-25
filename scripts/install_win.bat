@echo off
TITLE Draft2Desk Automatic Installer for Windows
echo ==========================================
echo     Draft2Desk Word Add-in Installer      
echo ==========================================
echo.

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set MANIFEST_TARGET=%APPDATA%\Microsoft\Word\AddIns

echo [1/3] Creating Manifest Folder...
if not exist "%MANIFEST_TARGET%" mkdir "%MANIFEST_TARGET%"

echo [2/3] Copying manifest.xml...
copy /Y "%PROJECT_DIR%\manifest.xml" "%MANIFEST_TARGET%\manifest.xml" >nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Manifest copied to %MANIFEST_TARGET%
) else (
    echo [X] Failed to copy manifest.xml
)

echo [3/3] Installing Python Dependencies and Starting Backend Server...
cd /d "%PROJECT_DIR%"

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python is not installed or not in PATH! Please install Python 3.9+ from python.org
    pause
    exit /b 1
)

pip install -r backend/requirements.txt
echo [✓] Server starting on http://127.0.0.1:8000
echo.
echo Open Microsoft Word -> Insert -> My Add-ins -> Shared Folder -> Select Draft2Desk!
echo.

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
pause
