#!/usr/bin/env pwsh
# Script de déploiement automatique de Last-Realm avec Docker
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

# Étape 1: Vérifier que Docker est installé
Write-Step "Vérification de Docker..."
try {
    $dockerVersion = docker --version
    Write-SuccessStep "Docker est installé: $dockerVersion"
} catch {
    Write-ErrorStep "Docker n'est pas installé ou n'est pas dans le PATH"
    Write-Host "Veuillez installer Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Vérifier que Docker est en cours d'exécution
Write-Step "Vérification que Docker est démarré..."
$dockerRunning = $false
$maxAttempts = 60
$attempt = 0

while (-not $dockerRunning -and $attempt -lt $maxAttempts) {
    try {
        docker info | Out-Null
        $dockerRunning = $true
        Write-SuccessStep "Docker est en cours d'exécution"
    } catch {
        if ($attempt -eq 0) {
            Write-Host "Docker Desktop n'est pas démarré. Démarrage en cours..." -ForegroundColor Yellow
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        }
        $attempt++
        Write-Host "Attente du démarrage de Docker... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $dockerRunning) {
    Write-ErrorStep "Impossible de démarrer Docker. Veuillez le démarrer manuellement."
    exit 1
}

# Étape 3: Créer le fichier .env s'il n'existe pas
Write-Step "Configuration des variables d'environnement..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-SuccessStep "Fichier .env créé depuis .env.example"
    } else {
        Write-ErrorStep "Fichier .env.example introuvable"
        exit 1
    }
} else {
    Write-SuccessStep "Fichier .env existe déjà"
}

# Étape 4: Arrêter les containers existants (si présents)
Write-Step "Nettoyage des containers existants..."
try {
    docker-compose down 2>$null
    Write-SuccessStep "Containers précédents arrêtés"
} catch {
    Write-Host "Aucun container à arrêter" -ForegroundColor Gray
}

# Étape 5: Construire les images Docker
Write-Host ""
Write-Step "Construction des images Docker..."
Write-Host "Cela peut prendre quelques minutes la première fois..." -ForegroundColor Yellow
Write-Host ""

$buildOutput = docker-compose build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-SuccessStep "Images Docker construites avec succès"
} else {
    Write-ErrorStep "Erreur lors de la construction des images"
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

# Étape 6: Démarrer les containers
Write-Host ""
Write-Step "Démarrage des containers..."
Write-Host ""

$upOutput = docker-compose up -d 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-SuccessStep "Containers démarrés avec succès"
} else {
    Write-ErrorStep "Erreur lors du démarrage des containers"
    Write-Host $upOutput -ForegroundColor Red
    exit 1
}

# Étape 7: Attendre que les services soient prêts
Write-Host ""
Write-Step "Attente du démarrage des services..."
Start-Sleep -Seconds 5

# Vérifier l'état des containers
$status = docker-compose ps 2>&1
Write-Host ""
Write-Host "État des containers:" -ForegroundColor Cyan
docker-compose ps

# Étape 8: Vérifier que le backend est démarré
Write-Host ""
Write-Step "Vérification du backend..."
Start-Sleep -Seconds 3

$backendLogs = docker-compose logs backend 2>&1
if ($backendLogs -match "Server is running") {
    Write-SuccessStep "Backend démarré avec succès"
} else {
    Write-Host "Avertissement: Le backend pourrait ne pas être complètement démarré" -ForegroundColor Yellow
    Write-Host "Logs du backend:" -ForegroundColor Yellow
    docker-compose logs backend
}

# Étape 9: Afficher les URLs
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ✓ Déploiement terminé!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Accès aux services:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:5000" -ForegroundColor White
Write-Host "   PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📊 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   Voir les logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Arrêter:              docker-compose down" -ForegroundColor White
Write-Host "   Redémarrer:           docker-compose restart" -ForegroundColor White
Write-Host "   Reconstruire:         docker-compose build" -ForegroundColor White
Write-Host ""

# Étape 10: Ouvrir le navigateur (optionnel)
Write-Host "Voulez-vous ouvrir l'application dans le navigateur? (O/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -match "^[OoYy]") {
    Write-Step "Ouverture du navigateur..."
    Start-Process "http://localhost:3000"
    Write-SuccessStep "Navigateur ouvert"
}

Write-Host ""
Write-Host "Bon développement! 🚀" -ForegroundColor Green
Write-Host ""
