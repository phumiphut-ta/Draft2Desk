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

echo [i] Stopping Draft2Desk server process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [✓] Stopped server process PID %%a
)

echo.
echo ==========================================
echo  Draft2Desk uninstalled successfully!    
echo ==========================================
echo.
pause
