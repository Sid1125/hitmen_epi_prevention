# HITMEN Build and Start Script
# This script builds the frontend and starts all services for production

Write-Host "HITMEN Production Build and Start" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if environment variables are set
$discordToken = $env:DISCORD_TOKEN
$channelId = $env:TARGET_CHANNEL_ID

if (-not $discordToken -or $discordToken -eq "your_bot_token_here") {
    Write-Host "⚠️  DISCORD_TOKEN not set - Discord bot will not start" -ForegroundColor Yellow
}

if (-not $channelId -or $channelId -eq "your_channel_id_here") {
    Write-Host "⚠️  TARGET_CHANNEL_ID not set - Discord bot will not start" -ForegroundColor Yellow
}

# Step 1: Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Build the frontend
Write-Host "`nBuilding frontend..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
    
    # Check if dist directory exists
    if (Test-Path "dist") {
        $fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
        Write-Host "📁 Built $fileCount files in dist/ directory" -ForegroundColor Gray
    } else {
        Write-Host "❌ dist/ directory not found after build" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to build frontend: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Stop any existing containers
Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
try {
    docker-compose -f src/forum_app/backend/docker-compose.yml down
    Write-Host "✅ Existing containers stopped" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not stop existing containers (may not exist)" -ForegroundColor Yellow
}

# Step 4: Start Docker services
Write-Host "`nStarting Docker services..." -ForegroundColor Yellow
try {
    docker-compose -f src/forum_app/backend/docker-compose.yml up -d
    Write-Host "✅ All services started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start services: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Wait for services to be ready
Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 6: Check service status
Write-Host "`n📊 Service Status Check:" -ForegroundColor Cyan

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

Write-Host "`n🎉 HITMEN Production Stack is Ready!" -ForegroundColor Green
Write-Host "`n🌐 Access Points:" -ForegroundColor Cyan
Write-Host "- Website: http://localhost" -ForegroundColor Gray
Write-Host "- API: http://localhost/api" -ForegroundColor Gray
Write-Host "- Marks Data: http://localhost/ig_marks.json" -ForegroundColor Gray

Write-Host "`n📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "- View all logs: docker-compose -f src/forum_app/backend/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host "- View bot logs: docker-compose -f src/forum_app/backend/docker-compose.yml logs -f discord_bot" -ForegroundColor Gray
Write-Host "- Stop services: docker-compose -f src/forum_app/backend/docker-compose.yml down" -ForegroundColor Gray
Write-Host "- Restart bot: docker-compose -f src/forum_app/backend/docker-compose.yml restart discord_bot" -ForegroundColor Gray

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Post Instagram usernames in your Discord channel" -ForegroundColor Gray
Write-Host "2. Check the Marks Gallery page for updates" -ForegroundColor Gray
Write-Host "3. Monitor bot logs for activity" -ForegroundColor Gray 