@echo off
setlocal enabledelayedexpansion

REM Configuration de la page de code UTF-8
chcp 65001 >nul

echo.
echo ================================
echo   Last-Realm - Docker Setup
echo ================================
echo.
echo Note: Ce script est conçu pour démarrer automatiquement Docker Desktop
echo       et puis lancer vos conteneurs.
echo.

REM Aller au répertoire du script
cd /d "%~dp0"

REM Vérifier si Docker Desktop est déjà lancé
echo Vérification de Docker Desktop...
powershell -NoProfile -Command "docker ps >nul 2>&1" 
if !ERRORLEVEL! NEQ 0 (
    echo.
    echo ⏳ Docker Desktop n'est pas actif. Lancement en cours...
    echo    Cela peut prendre 1-2 minutes...
    echo.
    
    REM Lancer Docker Desktop
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch-docker.ps1"
    
    if !ERRORLEVEL! NEQ 0 (
        echo.
        echo Erreur: Impossible de lancer Docker Desktop
        pause
        exit /b 1
    )
) else (
    echo ✓ Docker est déjà disponible
)

echo.
echo ================================
echo   Démarrage des services...
echo ================================
echo.

REM Lancer le script principal de déploiement
powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0start-docker.ps1"

REM Gérer les erreurs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Erreur lors du démarrage des services.
    pause
)
