@echo off
TITLE Draft2Desk Automatic Uninstaller for Windows
echo ==========================================
echo    Draft2Desk Word Add-in Uninstaller     
echo ==========================================
echo.

set MANIFEST_TARGET=%APPDATA%\Microsoft\Word\AddIns\manifest.xml

if exist "%MANIFEST_TARGET%" (
    del /F /Q "%MANIFEST_TARGET%"
    echo [✓] Draft2Desk Manifest removed from %MANIFEST_TARGET%
) else (
    echo [i] Draft2Desk Manifest was not found in AddIns folder.
)

echo [✓] Stopping any running server processes...
taskkill /FI "WINDOWTITLE eq uvicorn*" /F >nul 2>&1

echo.
echo Draft2Desk has been uninstalled successfully from Microsoft Word!
echo.
pause
