@echo off
REM Script batch pour démarrer Last-Realm avec Docker
REM Ce script appelle le script PowerShell principal

echo ================================
echo   Last-Realm - Docker Setup
echo ================================
echo.

REM Vérifier si PowerShell est disponible
where pwsh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Utilisation de PowerShell Core...
    pwsh -ExecutionPolicy Bypass -File "%~dp0start-docker.ps1"
) else (
    echo Utilisation de Windows PowerShell...
    powershell -ExecutionPolicy Bypass -File "%~dp0start-docker.ps1"
)

pause
