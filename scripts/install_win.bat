@echo off
TITLE Draft2Desk Automatic Installer for Windows
echo ==========================================
echo     Draft2Desk Word Add-in Installer      
echo ==========================================
echo.

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set MANIFEST_TARGET=%APPDATA%\Microsoft\Word\AddIns

echo [1/3] Preparing Word AddIns Folder...
if not exist "%MANIFEST_TARGET%" mkdir "%MANIFEST_TARGET%"

echo [2/3] Copying manifest.xml and registering Trusted Catalog...
copy /Y "%PROJECT_DIR%\manifest.xml" "%MANIFEST_TARGET%\manifest.xml" >nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Manifest copied to %MANIFEST_TARGET%
) else (
    echo [X] Failed to copy manifest.xml
)

reg add "HKCU\Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk" /v "Url" /t REG_SZ /d "%MANIFEST_TARGET%" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk" /v "Flags" /t REG_DWORD /d 1 /f >nul 2>&1
echo [✓] Trusted Catalog registered in Windows Registry automatically.

echo [3/3] Setting up Python Virtual Environment...
cd /d "%PROJECT_DIR%"

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Python is not installed or not in PATH! Please install Python 3.9+ from python.org
    pause
    exit /b 1
)

if not exist ".venv" (
    echo [i] Creating isolated virtual environment (.venv)...
    python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -q -r backend/requirements.txt
echo [✓] Python dependencies ready.

echo.
echo ========================================================
echo  Open Word -^> Insert -^> My Add-ins -^> Shared Folder -^> Draft2Desk
echo ========================================================
echo.

python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
pause
