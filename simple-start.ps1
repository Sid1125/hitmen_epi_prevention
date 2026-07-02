# Simple HITMEN Startup Script
# This script builds locally and starts services

Write-Host "Simple HITMEN Startup" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Build the frontend locally
Write-Host "`nBuilding frontend locally..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build frontend: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Stop any existing containers
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
try {
    docker-compose -f src/forum_app/backend/docker-compose.yml down
    Write-Host "✅ Existing containers stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not stop existing containers (may not exist)" -ForegroundColor Yellow
}

# Step 3: Start Docker services (excluding frontend)
Write-Host "`nStarting Docker services..." -ForegroundColor Yellow
try {
    docker-compose -f src/forum_app/backend/docker-compose.yml up -d
    Write-Host "✅ All services started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start services: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for services to be ready
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Check service status
Write-Host "`nService Status:" -ForegroundColor Cyan

# Check nginx
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Website accessible at http://localhost" -ForegroundColor Green
} catch {
    Write-Host "❌ Website not accessible" -ForegroundColor Red
}

# Check API
try {
    $response = Invoke-WebRequest -Uri "http://localhost/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ API not accessible" -ForegroundColor Red
}

# Check Discord bot
try {
    $logs = docker-compose -f src/forum_app/backend/docker-compose.yml logs discord_bot --tail=5
    if ($logs -match "Bot is online") {
        Write-Host "✅ Discord bot is online" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Discord bot may not be running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check Discord bot status" -ForegroundColor Red
}

# Check ig_marks.json
try {
    $response = Invoke-WebRequest -Uri "http://localhost/ig_marks.json" -UseBasicParsing -TimeoutSec 10
    $marks = $response.Content | ConvertFrom-Json
    Write-Host "✅ ig_marks.json accessible with $($marks.Count) marks" -ForegroundColor Green
} catch {
    Write-Host "❌ ig_marks.json not accessible" -ForegroundColor Red
}

Write-Host "`n🎉 HITMEN Stack is Ready!" -ForegroundColor Green
Write-Host "🌐 Website: http://localhost" -ForegroundColor Cyan
Write-Host "📊 API: http://localhost/api" -ForegroundColor Cyan
Write-Host "📄 Marks: http://localhost/ig_marks.json" -ForegroundColor Cyan

Write-Host "`n📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "- View logs: docker-compose -f src/forum_app/backend/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host "- Stop services: docker-compose -f src/forum_app/backend/docker-compose.yml down" -ForegroundColor Gray
Write-Host "- Restart bot: docker-compose -f src/forum_app/backend/docker-compose.yml restart discord_bot" -ForegroundColor Gray 