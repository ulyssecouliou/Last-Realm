#!/usr/bin/env pwsh
# Script d'arrêt de Last-Realm avec Docker

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Last-Realm - Arrêt Docker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Demander si on veut supprimer les volumes
Write-Host "Voulez-vous supprimer les données (volumes) ? (O/N)" -ForegroundColor Yellow
Write-Host "ATTENTION: Cela supprimera toutes les données de la base de données!" -ForegroundColor Red
$response = Read-Host

if ($response -match "^[OoYy]") {
    Write-Host "Arrêt et suppression des volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Containers et volumes supprimés" -ForegroundColor Green
} else {
    Write-Host "Arrêt des containers (conservation des données)..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✓ Containers arrêtés (données conservées)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour redémarrer: ./start-docker.ps1" -ForegroundColor Cyan
Write-Host ""
