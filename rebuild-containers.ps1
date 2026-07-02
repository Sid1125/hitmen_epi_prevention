# HITMEN Container Rebuild Script
# This script ensures you always get the latest frontend changes

Write-Host "🎯 HITMEN - Rebuilding Containers with Latest Changes" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$dockerComposePath = "D:\hitmen_epi_prevention\src\forum_app\backend"

try {
    Push-Location $dockerComposePath
    
    Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host "`n🧹 Cleaning up old images and build cache..." -ForegroundColor Yellow
    docker system prune -f
    
    Write-Host "`n🏗️ Building frontend with latest changes..." -ForegroundColor Yellow
    docker-compose build --no-cache frontend
    
    Write-Host "`n🚀 Starting all containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host "`n⏳ Waiting for containers to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    Write-Host "`n📊 Container Status:" -ForegroundColor Blue
    docker-compose ps
    
    Write-Host "`n🔍 Verifying services..." -ForegroundColor Yellow
    
    # Check ban list endpoint
    try {
        $banListResponse = Invoke-WebRequest -Uri "http://localhost/ban_list.txt" -Method Head -ErrorAction Stop
        if ($banListResponse.StatusCode -eq 200) {
            $contentLength = $banListResponse.Headers['Content-Length']
            Write-Host "✅ Ban List Endpoint: OK ($contentLength bytes)" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Ban List Endpoint: FAILED" -ForegroundColor Red
    }
    
    # Check main site
    try {
        $siteResponse = Invoke-WebRequest -Uri "http://localhost" -Method Head -ErrorAction Stop
        if ($siteResponse.StatusCode -eq 200) {
            Write-Host "✅ Main Site: OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Main Site: FAILED" -ForegroundColor Red
    }
    
    # Check Discord bot logs
    Write-Host "`n🤖 Discord Bot Status:" -ForegroundColor Blue
    $botLogs = docker-compose logs discord_bot | Select-String -Pattern "bot.*online|initialization.*complete|ban_list.*entries" | Select-Object -Last 3
    if ($botLogs) {
        $botLogs | ForEach-Object { Write-Host "   $_" -ForegroundColor Green }
    }
    
    Write-Host "`n🎉 Rebuild Complete!" -ForegroundColor Green
    Write-Host "📱 Frontend: http://localhost" -ForegroundColor Blue
    Write-Host "📂 Operations: http://localhost/operations" -ForegroundColor Blue
    Write-Host "📄 Ban List: http://localhost/ban_list.txt" -ForegroundColor Blue
    
    Write-Host "`n💡 Tips:" -ForegroundColor Cyan
    Write-Host "   - Clear browser cache (Ctrl+F5) or use incognito mode" -ForegroundColor White
    Write-Host "   - Check browser console (F12) for download debugging" -ForegroundColor White
    Write-Host "   - Run this script anytime you make frontend changes" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during rebuild: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
