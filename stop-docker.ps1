#!/usr/bin/env pwsh
# Script d'arret de Last-Realm avec Docker

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Last-Realm - Arret Docker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Demander si on veut supprimer les volumes
Write-Host "Voulez-vous supprimer les donnees (volumes) ? (O/N)" -ForegroundColor Yellow
Write-Host "ATTENTION: Cela supprimera toutes les donnees de la base de donnees!" -ForegroundColor Red
$response = Read-Host

if ($response -match "^[OoYy]") {
    Write-Host "Arret et suppression des volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "OK Containers et volumes supprimes" -ForegroundColor Green
} else {
    Write-Host "Arret des containers (conservation des donnees)..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "OK Containers arretes (donnees conservees)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour redemarrer: ./start-docker.ps1" -ForegroundColor Cyan
Write-Host ""
