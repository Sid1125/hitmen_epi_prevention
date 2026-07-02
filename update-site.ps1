# HITMEN - Quick Site Update Script
# Use this script to deploy your latest changes to the Docker site

Write-Host "🎯 HITMEN - Updating Live Site" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

try {
    Write-Host "`n🔨 Building latest changes..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📦 Copying files to nginx container..." -ForegroundColor Yellow
    docker cp "D:\hitmen_epi_prevention\dist\." backend-nginx-1:/usr/share/nginx/html/
    
    Write-Host "🔄 Restarting nginx..." -ForegroundColor Yellow
    docker restart backend-nginx-1
    
    Write-Host "✅ Site updated successfully!" -ForegroundColor Green
    Write-Host "🌐 Visit: http://localhost" -ForegroundColor Blue
    Write-Host "💡 Clear browser cache (Ctrl+F5) to see changes" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
