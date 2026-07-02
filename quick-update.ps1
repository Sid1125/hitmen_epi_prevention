# HITMEN Quick Update Script
# For when you just want to update the frontend without full rebuild

param(
    [switch]$FullRebuild
)

$dockerComposePath = "D:\hitmen_epi_prevention\src\forum_app\backend"

if ($FullRebuild) {
    Write-Host "🔄 Running full rebuild..." -ForegroundColor Cyan
    & "D:\hitmen_epi_prevention\rebuild-containers.ps1"
    return
}

Write-Host "⚡ HITMEN - Quick Frontend Update" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

try {
    Push-Location $dockerComposePath
    
    Write-Host "`n🏗️ Rebuilding frontend..." -ForegroundColor Blue
    docker-compose build --no-cache frontend
    
    Write-Host "`n🔄 Restarting containers..." -ForegroundColor Blue
    docker-compose restart frontend nginx
    
    Write-Host "`n✅ Update complete!" -ForegroundColor Green
    Write-Host "🌐 Site: http://localhost" -ForegroundColor Blue
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "💡 Try running with -FullRebuild flag" -ForegroundColor Yellow
} finally {
    Pop-Location
}
