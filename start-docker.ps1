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

# Etape 2: Verifier et demarrer Docker Desktop si necessaire
Write-Step "Verification que Docker est démarré..."
$dockerRunning = $false
$maxAttempts = 120
$attempt = 0

while (-not $dockerRunning -and $attempt -lt $maxAttempts) {
    $testConnection = Invoke-Expression "docker ps 2>&1" -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
        Write-SuccessStep "Docker est en cours d'execution"
    } else {
        if ($attempt -eq 0) {
            Write-Host "Docker n'est pas accessible. Lancement de Docker Desktop..." -ForegroundColor Yellow
            Write-Host "Cela peut prendre 1-2 minutes..." -ForegroundColor Yellow
            
            $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            
            if (Test-Path $dockerDesktopPath) {
                Write-Host "Lancement: $dockerDesktopPath" -ForegroundColor Cyan
                # Lancer en arrière-plan sans bloquer
                & cmd.exe /c "start `"Docker`" `"$dockerDesktopPath`"" 2>$null
                Start-Sleep -Seconds 5
            }
        }
        
        $attempt++
        if ($attempt % 20 -eq 0) {
            Write-Host "⏳ Attente... ($attempt/$maxAttempts secondes)" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 1
    }
}

if (-not $dockerRunning) {
    Write-ErrorStep "Docker n'a pas démarré"
    Write-Host ""
    Write-Host "⚠️ Solution: Lancez Docker Desktop MANUELLEMENT" -ForegroundColor Yellow
    Write-Host "  1. Cliquez sur le menu Démarrer Windows" -ForegroundColor White
    Write-Host "  2. Tapez 'Docker'" -ForegroundColor White
    Write-Host "  3. Cliquez sur 'Docker Desktop'" -ForegroundColor White
    Write-Host "  4. Attendez que Docker soit complètement chargé (voir l'icône Docker dans la barre de tâches)" -ForegroundColor White
    Write-Host "  5. Relancez ce script" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou, exécutez cette commande PowerShell directement:" -ForegroundColor Cyan
    Write-Host '  & "C:\Program Files\Docker\Docker\Docker Desktop.exe"' -ForegroundColor White
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

# Etape 4: Verifier la connexion a Docker
Write-Host ""
Write-Step "Verification de la connexion a Docker Engine..."
$dockerConnectionTries = 0
$dockerConnected = $false

while (-not $dockerConnected -and $dockerConnectionTries -lt 30) {
    $testOutput = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerConnected = $true
        Write-SuccessStep "Connexion a Docker etablie"
    } else {
        $dockerConnectionTries++
        Write-Host "Attente de la connexion a Docker... ($dockerConnectionTries/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $dockerConnected) {
    Write-ErrorStep "Impossible de se connecter a Docker Engine"
    Write-Host "Les logs Docker Desktop:" -ForegroundColor Yellow
    Write-Host $testOutput -ForegroundColor Red
    Write-Host "Solutions possibles:" -ForegroundColor Cyan
    Write-Host "1. Assurez-vous que Docker Desktop est complètement lancé" -ForegroundColor White
    Write-Host "2. Redémarrez Docker Desktop" -ForegroundColor White
    Write-Host "3. Relancez le script" -ForegroundColor White
    exit 1
}

# Etape 5: Arreter les containers existants (si presents)
Write-Step "Nettoyage des containers existants..."
try {
    docker-compose down 2>$null
    Write-SuccessStep "Containers precedents arretes"
} catch {
    Write-Host "Aucun container a arreter" -ForegroundColor Gray
}

# Etape 6: Construire les images Docker
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

# Etape 7: Demarrer les containers
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

# Etape 8: Attendre que les services soient prets
Write-Host ""
Write-Step "Attente du demarrage des services..."
Start-Sleep -Seconds 5

# Verifier l'etat des containers
$status = docker-compose ps 2>&1
Write-Host ""
Write-Host "Etat des containers:" -ForegroundColor Cyan
docker-compose ps

# Etape 9: Verifier que le backend est demarré
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

# Etape 10: Afficher les URLs
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

# Etape 11: Ouvrir automatiquement le navigateur
Write-Host ""
Write-Step "Ouverture du navigateur dans 3 secondes..."
Start-Sleep -Seconds 3
Write-Host "Ouverture de http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"
Write-SuccessStep "Navigateur ouvert"

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Bon developpement!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour arreter les services:" -ForegroundColor Cyan
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
