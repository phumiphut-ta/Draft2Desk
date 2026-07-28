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

reg delete "HKCU\Software\Microsoft\Office\16.0\Word\Security\Trusted Catalogs\Draft2Desk" /f >nul 2>&1
echo [✓] Removed Trusted Catalog entry from Windows Registry.

echo [i] Stopping Draft2Desk server process on port 8000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [✓] Stopped server process PID %%a
)

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..
set DB_FILE=%PROJECT_DIR%\draft2desk.db

if exist "%DB_FILE%" (
    echo.
    choice /C YN /M "[?] Do you want to delete your template database (draft2desk.db)? (Y=Delete, N=Keep)"
    if errorlevel 2 (
        echo [i] Database draft2desk.db preserved safely.
    ) else (
        del /F /Q "%DB_FILE%"
        echo [✓] Database draft2desk.db deleted.
    )
)

echo.
echo ==========================================
echo  Draft2Desk uninstalled successfully!    
echo ==========================================
echo.
pause
