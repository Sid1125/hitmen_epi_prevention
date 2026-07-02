# HITMEN Development Hot Reload Script
# This script automatically rebuilds and deploys changes when files are modified

Write-Host "🚀 Starting HITMEN Development Hot Reload System..." -ForegroundColor Green
Write-Host "📁 Monitoring: D:\hitmen_epi_prevention\src\" -ForegroundColor Yellow
Write-Host "🔄 Auto-rebuild and deploy on file changes" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray

# Change to project root
Set-Location "D:\hitmen_epi_prevention"

# Function to rebuild and deploy
function Rebuild-And-Deploy {
    param([string]$ChangedFile)
    
    Write-Host "`n🔄 Change detected: $ChangedFile" -ForegroundColor Cyan
    Write-Host "⏰ $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    
    try {
        # Clear old build
        Write-Host "🗑️  Clearing old build..." -ForegroundColor Yellow
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
        }
        
        # Rebuild frontend
        Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
        $buildResult = npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            Write-Host $buildResult -ForegroundColor Red
            return
        }
        
        # Copy to container
        Write-Host "📦 Deploying to container..." -ForegroundColor Yellow
        Set-Location "src\forum_app\backend"
        
        # Check if containers are running
        $containers = docker ps --filter "name=backend-" --format "{{.Names}}"
        if (-not $containers) {
            Write-Host "⚠️  Containers not running. Starting them..." -ForegroundColor Yellow
            docker-compose up -d
            Start-Sleep -Seconds 10
        }
        
        # Copy new files
        docker cp "..\..\..\dist\." backend-frontend-1:/code/dist/ 2>&1 | Out-Null
        
        # Restart nginx to pick up changes
        docker restart backend-nginx-1 2>&1 | Out-Null
        
        Write-Host "✅ Deployment complete!" -ForegroundColor Green
        Write-Host "🌐 Changes live at: http://localhost/" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Error during rebuild: $_" -ForegroundColor Red
    } finally {
        Set-Location "D:\hitmen_epi_prevention"
    }
}

# Initial build and deploy
Write-Host "`n🔄 Performing initial build and deploy..." -ForegroundColor Cyan
Rebuild-And-Deploy "Initial startup"

# Set up file watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "D:\hitmen_epi_prevention\src"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Watch for specific file types
$watcher.Filter = "*.*"

# Debounce timer to avoid multiple rebuilds for rapid changes
$timer = New-Object System.Timers.Timer
$timer.Interval = 2000  # 2 seconds
$timer.AutoReset = $false

$lastChanged = ""

# Event handler for file changes
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Filter relevant files
    if ($name -match '\.(ts|tsx|js|jsx|css|scss|html|json)$' -and 
        $name -notmatch 'node_modules|\.git|dist|build|\.cache') {
        
        $global:lastChanged = $path
        $global:timer.Stop()
        $global:timer.Start()
    }
}

# Timer event for debounced rebuild
$timerAction = {
    if ($global:lastChanged) {
        Rebuild-And-Deploy $global:lastChanged
        $global:lastChanged = ""
    }
}

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Renamed" -Action $action
Register-ObjectEvent -InputObject $timer -EventName "Elapsed" -Action $timerAction

Write-Host "`n✅ File watcher active! Make changes to any file in src/ and they'll be deployed automatically." -ForegroundColor Green

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    $timer.Dispose()
    Write-Host "`n🛑 File watcher stopped." -ForegroundColor Yellow
}
