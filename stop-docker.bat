@echo off
REM Script batch pour arrêter Last-Realm Docker
REM Ce script appelle le script PowerShell d'arrêt

echo ================================
echo   Last-Realm - Arrêt Docker
echo ================================
echo.

REM Vérifier si PowerShell est disponible
where pwsh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Utilisation de PowerShell Core...
    pwsh -ExecutionPolicy Bypass -File "%~dp0stop-docker.ps1"
) else (
    echo Utilisation de Windows PowerShell...
    powershell -ExecutionPolicy Bypass -File "%~dp0stop-docker.ps1"
)

pause
