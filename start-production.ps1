# HITMEN Production Startup Script
# This script builds the frontend and starts all services for production

Write-Host "🚀 Starting HITMEN Production Stack..." -ForegroundColor Cyan

# Check if environment variables are set
$discordToken = $env:DISCORD_TOKEN
$channelId = $env:TARGET_CHANNEL_ID

if (-not $discordToken -or $discordToken -eq "your_bot_token_here") {
    Write-Host "⚠️  DISCORD_TOKEN not set - Discord bot will not start" -ForegroundColor Yellow
}

if (-not $channelId -or $channelId -eq "your_channel_id_here") {
    Write-Host "⚠️  TARGET_CHANNEL_ID not set - Discord bot will not start" -ForegroundColor Yellow
}

# Step 1: Build the frontend using Docker
Write-Host "`n📦 Building frontend with Docker..." -ForegroundColor Yellow
try {
    # Build the frontend container
    docker build -f frontend.Dockerfile -t hitmen-frontend .
    Write-Host "✅ Frontend container built successfully" -ForegroundColor Green
    
    # Run the container to build the app
    docker run --rm -v ${PWD}/dist:/code/dist hitmen-frontend
    Write-Host "✅ React app built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build frontend: $_" -ForegroundColor Red
    Write-Host "Make sure you're in the project root directory" -ForegroundColor Yellow
    exit 1
}

# Step 2: Start Docker services (excluding frontend)
Write-Host "`n🐳 Starting Docker services..." -ForegroundColor Yellow
try {
    docker-compose -f src/forum_app/backend/docker-compose.yml up -d
    Write-Host "✅ All services started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start services: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for services to be ready
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Check service status
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan

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

Write-Host "`n🎉 Production stack is ready!" -ForegroundColor Green
Write-Host "🌐 Website: http://localhost" -ForegroundColor Cyan
Write-Host "📊 API: http://localhost/api" -ForegroundColor Cyan
Write-Host "📄 Marks: http://localhost/ig_marks.json" -ForegroundColor Cyan
Write-Host "`n📋 Useful commands:" -ForegroundColor Yellow
Write-Host "- View logs: docker-compose -f src/forum_app/backend/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host "- Stop services: docker-compose -f src/forum_app/backend/docker-compose.yml down" -ForegroundColor Gray
Write-Host "- Restart bot: docker-compose -f src/forum_app/backend/docker-compose.yml restart discord_bot" -ForegroundColor Gray 