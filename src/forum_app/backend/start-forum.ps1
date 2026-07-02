#!/usr/bin/env powershell

Write-Host "🕶️ HITMEN Forum Backend Startup Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Navigate to backend directory
Set-Location "src\forum_app\backend"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please update it with your settings." -ForegroundColor Green
}

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

Write-Host "🐳 Starting Docker services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
docker-compose exec -T api alembic upgrade head

Write-Host "" -ForegroundColor White
Write-Host "✅ Forum backend is now running!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "📖 API Documentation:" -ForegroundColor Yellow
Write-Host "   Swagger UI: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   ReDoc:      http://localhost:8000/redoc" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔧 Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs:       docker-compose logs -f api" -ForegroundColor White
Write-Host "   Stop services:   docker-compose down" -ForegroundColor White
Write-Host "   Restart:         docker-compose restart api" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎯 Ready for HITMEN operations!" -ForegroundColor Green
