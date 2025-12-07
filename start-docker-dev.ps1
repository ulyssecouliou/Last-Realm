Write-Host "🛑 Stopping old containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "⏳ Waiting..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "🚀 Starting Last Realm in DEVELOPMENT mode..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
docker-compose -f docker-compose.dev.yml up --build
