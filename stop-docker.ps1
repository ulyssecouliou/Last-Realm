#!/usr/bin/env pwsh
# Script d'arrêt de Last-Realm avec Docker

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Last-Realm - Arrêt Docker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est disponible
Write-Host "> Vérification de Docker..." -ForegroundColor Green
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "X Docker n'est pas en cours d'exécution ou n'est pas installé" -ForegroundColor Red
        Write-Host ""
        Write-Host "Les containers ne peuvent pas être arrêtés." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
    Write-Host "OK Docker est disponible" -ForegroundColor Green
} catch {
    Write-Host "X Erreur lors de la vérification de Docker: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""

# Demander si on veut supprimer les volumes
Write-Host "Voulez-vous supprimer les données (volumes) ? (O/N)" -ForegroundColor Yellow
Write-Host "ATTENTION: Cela supprimera toutes les données de la base de données!" -ForegroundColor Red
$response = Read-Host

Write-Host ""

try {
    if ($response -match "^[OoYy]") {
        Write-Host "Arrêt et suppression des volumes..." -ForegroundColor Yellow
        docker-compose down -v 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Containers et volumes supprimés" -ForegroundColor Green
        } else {
            Write-Host "X Erreur lors de la suppression" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Arrêt des containers (conservation des données)..." -ForegroundColor Yellow
        docker-compose down 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Containers arrêtés (données conservées)" -ForegroundColor Green
        } else {
            Write-Host "X Erreur lors de l'arrêt" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "X Exception lors de l'arrêt: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host ""
Write-Host "Pour redémarrer: ./start-docker.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
