# HITMEN Discord Bot Startup Script
# This script starts the Discord bot with proper environment variables

Write-Host "🤖 Starting HITMEN Discord Bot..." -ForegroundColor Cyan

# Check if environment variables are set
$discordToken = $env:DISCORD_TOKEN
$channelId = $env:TARGET_CHANNEL_ID

if (-not $discordToken) {
    Write-Host "❌ DISCORD_TOKEN environment variable not set!" -ForegroundColor Red
    Write-Host "Please set DISCORD_TOKEN=your_bot_token_here" -ForegroundColor Yellow
    exit 1
}

if (-not $channelId) {
    Write-Host "❌ TARGET_CHANNEL_ID environment variable not set!" -ForegroundColor Red
    Write-Host "Please set TARGET_CHANNEL_ID=your_channel_id_here" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host "📡 Channel ID: $channelId" -ForegroundColor Gray

# Start the bot using Docker Compose
Write-Host "🚀 Starting Discord bot with Docker Compose..." -ForegroundColor Cyan

try {
    docker-compose -f src/forum_app/backend/docker-compose.yml up discord_bot -d
    Write-Host "✅ Discord bot started successfully!" -ForegroundColor Green
    Write-Host "📊 Monitor logs with: docker-compose -f src/forum_app/backend/docker-compose.yml logs -f discord_bot" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start Discord bot: $_" -ForegroundColor Red
    exit 1
} 