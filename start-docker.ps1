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

# etape 1: Verifier que Docker est installe
Write-Step "Verification de Docker..."
try {
    $dockerVersion = docker --version
    Write-SuccessStep "Docker est installe: $dockerVersion"
} catch {
    Write-ErrorStep "Docker n'est pas installe ou n'est pas dans le PATH"
    Write-Host "Veuillez installer Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# etape 2: Verifier que Docker est en cours d'execution
Write-Step "Verification que Docker est demarre..."
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
            Write-Host "Docker Desktop n'est pas demarre. Demarrage en cours..." -ForegroundColor Yellow
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

# etape 3: Creer le fichier .env s'il n'existe pas
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

# etape 4: Arrêter les containers existants (si presents)
Write-Step "Nettoyage des containers existants..."
try {
    docker-compose down 2>$null
    Write-SuccessStep "Containers precedents arrêtes"
} catch {
    Write-Host "Aucun container a arrêter" -ForegroundColor Gray
}

# etape 5: Construire les images Docker
Write-Host ""
Write-Step "Construction des images Docker..."
Write-Host "Cela peut prendre quelques minutes la premiere fois..." -ForegroundColor Yellow
Write-Host ""

$buildOutput = docker-compose build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-SuccessStep "Images Docker construites avec succes"
} else {
    Write-ErrorStep "Erreur lors de la construction des images"
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

# etape 6: Demarrer les containers
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

# etape 7: Attendre que les services soient prêts
Write-Host ""
Write-Step "Attente du demarrage des services..."
Start-Sleep -Seconds 5

# Verifier l'etat des containers
$status = docker-compose ps 2>&1
Write-Host ""
Write-Host "etat des containers:" -ForegroundColor Cyan
docker-compose ps

# etape 8: Verifier que le backend est demarre
Write-Host ""
Write-Step "Verification du backend..."
Start-Sleep -Seconds 3

$backendLogs = docker-compose logs backend 2>&1
if ($backendLogs -match "Server is running") {
    Write-SuccessStep "Backend demarre avec succes"
} else {
    Write-Host "Avertissement: Le backend pourrait ne pas être completement demarre" -ForegroundColor Yellow
    Write-Host "Logs du backend:" -ForegroundColor Yellow
    docker-compose logs backend
}

# etape 9: Afficher les URLs
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ✓ Deploiement termine!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Acces aux services:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📊 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   Voir les logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Arrêter:              docker-compose down" -ForegroundColor White
Write-Host "   Redemarrer:           docker-compose restart" -ForegroundColor White
Write-Host "   Reconstruire:         docker-compose build" -ForegroundColor White
Write-Host ""

# etape 10: Ouvrir le navigateur (optionnel)
Write-Host "Voulez-vous ouvrir l'application dans le navigateur? (O/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -match "^[OoYy]") {
    Write-Step "Ouverture du navigateur..."
    Start-Process "http://localhost:3000"
    Write-SuccessStep "Navigateur ouvert"
}

Write-Host ""
Write-Host "Bon developpement ! " -ForegroundColor Green
Write-Host ""
