#!/usr/bin/env pwsh
# Script de deploiement automatique de Last-Realm avec Docker
# Auteur: Last-Realm Team
# Date: 2025-11-27

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Last-Realm - Docker Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les messages avec couleur
function Write-Step {
    param($Message)
    Write-Host "> $Message" -ForegroundColor Green
}

function Write-ErrorStep {
    param($Message)
    Write-Host "X $Message" -ForegroundColor Red
}

function Write-SuccessStep {
    param($Message)
    Write-Host "OK $Message" -ForegroundColor Green
}

# Etape 1: Verifier que Docker est installe
Write-Step "Verification de Docker..."
try {
    $dockerVersion = docker --version
    Write-SuccessStep "Docker est installe: $dockerVersion"
} catch {
    Write-ErrorStep "Docker n'est pas installe ou n'est pas dans le PATH"
    Write-Host "Veuillez installer Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Etape 2: Verifier que Docker est en cours d'execution
Write-Step "Verification que Docker est demarré..."
$dockerRunning = $false
$maxAttempts = 60
$attempt = 0

while (-not $dockerRunning -and $attempt -lt $maxAttempts) {
    try {
        docker info | Out-Null
        $dockerRunning = $true
        Write-SuccessStep "Docker est en cours d'execution"
    } catch {
        if ($attempt -eq 0) {
            Write-Host "Docker Desktop n'est pas demarré. Demarrage en cours..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        }
        $attempt++
        Write-Host "Attente du demarrage de Docker... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $dockerRunning) {
    Write-ErrorStep "Impossible de demarrer Docker. Veuillez le demarrer manuellement."
    exit 1
}

# Etape 3: Creer le fichier .env s'il n'existe pas
Write-Step "Configuration des variables d'environnement..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-SuccessStep "Fichier .env cree depuis .env.example"
    } else {
        Write-ErrorStep "Fichier .env.example introuvable"
        exit 1
    }
} else {
    Write-SuccessStep "Fichier .env existe deja"
}

# Etape 4: Arreter les containers existants (si presents)
Write-Step "Nettoyage des containers existants..."
try {
    docker-compose down 2>$null
    Write-SuccessStep "Containers precedents arretes"
} catch {
    Write-Host "Aucun container a arreter" -ForegroundColor Gray
}

# Etape 5: Construire les images Docker
Write-Host ""
Write-Step "Construction des images Docker..."
Write-Host "Cela peut prendre quelques minutes la premiere fois..." -ForegroundColor Yellow
Write-Host ""

$buildOutput = docker-compose build --no-cache 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-SuccessStep "Images Docker construites avec succes"
} else {
    Write-ErrorStep "Erreur lors de la construction des images"
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

# Etape 6: Demarrer les containers
Write-Host ""
Write-Step "Demarrage des containers..."
Write-Host ""

$upOutput = docker-compose up -d 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-SuccessStep "Containers demarres avec succes"
} else {
    Write-ErrorStep "Erreur lors du demarrage des containers"
    Write-Host $upOutput -ForegroundColor Red
    exit 1
}

# Etape 7: Attendre que les services soient prets
Write-Host ""
Write-Step "Attente du demarrage des services..."
Start-Sleep -Seconds 5

# Verifier l'etat des containers
$status = docker-compose ps 2>&1
Write-Host ""
Write-Host "Etat des containers:" -ForegroundColor Cyan
docker-compose ps

# Etape 8: Verifier que le backend est demarré
Write-Host ""
Write-Step "Verification du backend..."
Start-Sleep -Seconds 3

$backendLogs = docker-compose logs backend 2>&1
if ($backendLogs -match "Server is running") {
    Write-SuccessStep "Backend demarré avec succes"
} else {
    Write-Host "Avertissement: Le backend pourrait ne pas etre completement demarré" -ForegroundColor Yellow
    Write-Host "Logs du backend:" -ForegroundColor Yellow
    docker-compose logs backend
}

# Etape 9: Afficher les URLs
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  OK Deploiement termine!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "   Voir les logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Arreter:              docker-compose down" -ForegroundColor White
Write-Host "   Redemarrer:           docker-compose restart" -ForegroundColor White
Write-Host "   Reconstruire:         docker-compose build" -ForegroundColor White
Write-Host ""

# Etape 10: Ouvrir le navigateur (optionnel)
Write-Host "Voulez-vous ouvrir l'application dans le navigateur? (O/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -match "^[OoYy]") {
    Write-Step "Ouverture du navigateur..."
    Start-Process "http://localhost:3000"
    Write-SuccessStep "Navigateur ouvert"
}

Write-Host ""
Write-Host "Bon developpement!" -ForegroundColor Green
Write-Host ""
