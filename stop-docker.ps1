#!/usr/bin/env pwsh
# Script d'arrêt de Last-Realm avec Docker

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Last-Realm - Arret Docker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est disponible
Write-Host "> Verification de Docker..." -ForegroundColor Green
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "X Docker n'est pas en cours d'execution ou n'est pas installe" -ForegroundColor Red
        Write-Host ""
        Write-Host "Les containers ne peuvent pas être arretes." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Appuyez sur Entree pour quitter"
        exit 1
    }
    Write-Host "OK Docker est disponible" -ForegroundColor Green
} catch {
    Write-Host "X Erreur lors de la verification de Docker: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""

# Demander si on veut supprimer les volumes
Write-Host "Voulez-vous supprimer les donnees (volumes) ? (O/N)" -ForegroundColor Yellow
Write-Host "ATTENTION: Cela supprimera toutes les données de la base de données!" -ForegroundColor Red
$response = Read-Host

Write-Host ""

try {
    if ($response -match "^[OoYy]") {
        Write-Host "Arret et suppression des volumes..." -ForegroundColor Yellow
        docker-compose down -v 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Containers et volumes supprimes" -ForegroundColor Green
        } else {
            Write-Host "X Erreur lors de la suppression" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Arret des containers (conservation des donnees)..." -ForegroundColor Yellow
        docker-compose down 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Containers arretes (donnees conservees)" -ForegroundColor Green
        } else {
            Write-Host "X Erreur lors de l'arret" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "X Exception lors de l'arrêt: $_" -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "Pour redémarrer: ./start-docker.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenetre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
