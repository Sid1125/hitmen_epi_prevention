# HITMEN Discord Bot Test Script
# This script tests the Discord bot setup and functionality

Write-Host "🧪 Testing HITMEN Discord Bot Setup..." -ForegroundColor Cyan

# Test 1: Check environment variables
Write-Host "`n📋 Test 1: Environment Variables" -ForegroundColor Yellow
$discordToken = $env:DISCORD_TOKEN
$channelId = $env:TARGET_CHANNEL_ID

if ($discordToken -and $discordToken -ne "your_bot_token_here") {
    Write-Host "✅ DISCORD_TOKEN is set" -ForegroundColor Green
} else {
    Write-Host "❌ DISCORD_TOKEN not properly configured" -ForegroundColor Red
}

if ($channelId -and $channelId -ne "your_channel_id_here") {
    Write-Host "✅ TARGET_CHANNEL_ID is set" -ForegroundColor Green
} else {
    Write-Host "❌ TARGET_CHANNEL_ID not properly configured" -ForegroundColor Red
}

# Test 2: Check Docker containers
Write-Host "`n🐳 Test 2: Docker Containers" -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | findstr discord_bot
    if ($containers) {
        Write-Host "✅ Discord bot container is running" -ForegroundColor Green
        Write-Host $containers -ForegroundColor Gray
    } else {
        Write-Host "❌ Discord bot container not found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Docker not running or bot not started" -ForegroundColor Red
}

# Test 3: Check bot logs
Write-Host "`n📊 Test 3: Bot Logs" -ForegroundColor Yellow
try {
    $logs = docker-compose -f src/forum_app/backend/docker-compose.yml logs discord_bot --tail=10
    if ($logs -match "Bot is online") {
        Write-Host "✅ Bot is online and running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Bot may not be fully started" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot access bot logs" -ForegroundColor Red
}

# Test 4: Check ig_marks.json file
Write-Host "`n📄 Test 4: Marks File" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost/ig_marks.json" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $marks = $response.Content | ConvertFrom-Json
        Write-Host "✅ ig_marks.json is accessible" -ForegroundColor Green
        Write-Host "📊 Found $($marks.Count) marks" -ForegroundColor Gray
    } else {
        Write-Host "❌ ig_marks.json not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot access ig_marks.json" -ForegroundColor Red
}

# Test 5: Check website integration
Write-Host "`n🌐 Test 5: Website Integration" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Website is accessible" -ForegroundColor Green
        Write-Host "🌐 Visit http://localhost and navigate to 'Marks Gallery'" -ForegroundColor Gray
    } else {
        Write-Host "❌ Website not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot access website" -ForegroundColor Red
}

# Summary
Write-Host "`n📋 Test Summary" -ForegroundColor Cyan
Write-Host "To complete setup:" -ForegroundColor Yellow
Write-Host "1. Set DISCORD_TOKEN and TARGET_CHANNEL_ID environment variables" -ForegroundColor Gray
Write-Host "2. Start the bot: .\start-discord-bot.ps1" -ForegroundColor Gray
Write-Host "3. Test in Discord by posting Instagram usernames" -ForegroundColor Gray
Write-Host "4. Check Marks Gallery at http://localhost" -ForegroundColor Gray

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "- Post Instagram usernames in your Discord channel" -ForegroundColor Gray
Write-Host "- Check the Marks Gallery page for updates" -ForegroundColor Gray
Write-Host "- Monitor bot logs for activity" -ForegroundColor Gray 