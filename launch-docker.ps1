#!/usr/bin/env pwsh
# Script simple pour lancer Docker Desktop de manière fiable

Write-Host "🐳 Lancement de Docker Desktop..." -ForegroundColor Cyan

$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker Desktop not found at $dockerPath" -ForegroundColor Red
    exit 1
}

# Vérifier si Docker est déjà en cours d'exécution
try {
    docker ps | Out-Null
    Write-Host "✅ Docker est déjà lancé!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "Docker n'est pas accessible, lancement..." -ForegroundColor Yellow
}

# Lancer Docker Desktop
Write-Host "Ouverture de Docker Desktop..." -ForegroundColor Cyan
& cmd.exe /c "start `"Docker`" `"$dockerPath`"" 2>$null

Write-Host "⏳ Attente du démarrage de Docker (cela peut prendre 1-2 minutes)..." -ForegroundColor Yellow

# Attendre que Docker soit prêt
$dockerReady = $false
$attempts = 0
$maxAttempts = 120

while (-not $dockerReady -and $attempts -lt $maxAttempts) {
    try {
        docker ps | Out-Null
        $dockerReady = $true
        Write-Host "✅ Docker est prêt!" -ForegroundColor Green
    } catch {
        $attempts++
        if ($attempts % 15 -eq 0) {
            Write-Host "⏳ Toujours en attente... ($attempts/$maxAttempts secondes)" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 1
    }
}

if (-not $dockerReady) {
    Write-Host "❌ Docker n'a pas démarré après 2 minutes" -ForegroundColor Red
    Write-Host "Veuillez vérifier votre installation Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Docker Desktop est maintenant disponible!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant lancer: .\start-docker.bat" -ForegroundColor Cyan
Write-Host ""
