# HITMEN Container Setup Script
# This script sets up your containers with proper data initialization

Write-Host "🎯 HITMEN EPI Prevention - Container Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$dockerComposePath = "D:\hitmen_epi_prevention\src\forum_app\backend"
$banListPath = "D:\hitmen_epi_prevention\ban_list.txt"

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check if Docker is running
    try {
        docker --version | Out-Null
        Write-Host "✅ Docker is available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker is not available or not running!" -ForegroundColor Red
        exit 1
    }
    
    # Check if docker-compose is available
    try {
        docker-compose --version | Out-Null
        Write-Host "✅ Docker Compose is available" -ForegroundColor Green
    } catch {
        Write-Host "❌ Docker Compose is not available!" -ForegroundColor Red
        exit 1
    }
    
    # Check if ban_list.txt exists
    if (Test-Path $banListPath) {
        $lineCount = (Get-Content $banListPath).Count
        Write-Host "✅ ban_list.txt found with $lineCount entries" -ForegroundColor Green
    } else {
        Write-Host "❌ ban_list.txt not found at: $banListPath" -ForegroundColor Red
        Write-Host "Please ensure the ban list file exists in the project root." -ForegroundColor Yellow
        exit 1
    }
}

# Function to stop and clean existing containers
function Stop-ExistingContainers {
    Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
    
    try {
        Push-Location $dockerComposePath
        
        # Stop and remove containers with volumes
        Write-Host "Stopping containers..." -ForegroundColor Blue
        docker-compose down -v --remove-orphans
        
        # Clean up any orphaned volumes
        Write-Host "Cleaning up orphaned volumes..." -ForegroundColor Blue
        docker volume prune -f
        
        Write-Host "✅ Existing containers stopped and cleaned" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error stopping containers: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Function to build and start containers
function Start-Containers {
    Write-Host "`n🚀 Building and starting containers..." -ForegroundColor Yellow
    
    try {
        Push-Location $dockerComposePath
        
        # Build containers
        Write-Host "Building containers..." -ForegroundColor Blue
        docker-compose build --no-cache discord_bot
        
        # Start containers
        Write-Host "Starting containers..." -ForegroundColor Blue
        docker-compose up -d
        
        Write-Host "✅ Containers started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error starting containers: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

# Function to wait for containers to be ready
function Wait-ForContainers {
    Write-Host "`n⏳ Waiting for containers to be ready..." -ForegroundColor Yellow
    
    $maxWait = 60  # Maximum wait time in seconds
    $waited = 0
    
    while ($waited -lt $maxWait) {
        try {
            Push-Location $dockerComposePath
            
            # Check if nginx is responding
            $nginxStatus = docker-compose ps nginx | Select-String "Up"
            $botStatus = docker-compose ps discord_bot | Select-String "Up"
            
            if ($nginxStatus -and $botStatus) {
                Write-Host "✅ All containers are ready!" -ForegroundColor Green
                return $true
            }
            
            Write-Host "⏳ Still waiting... ($waited/$maxWait seconds)" -ForegroundColor Blue
            Start-Sleep -Seconds 5
            $waited += 5
            
        } catch {
            Write-Host "❌ Error checking container status: $_" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    }
    
    Write-Host "❌ Containers did not become ready within $maxWait seconds" -ForegroundColor Red
    return $false
}

# Function to verify data initialization
function Test-DataInitialization {
    Write-Host "`n🔍 Verifying data initialization..." -ForegroundColor Yellow
    
    try {
        Push-Location $dockerComposePath
        
        # Check if ban_list.txt exists in the container
        $banListExists = docker-compose exec -T nginx test -f /data/ban_list.txt
        if ($LASTEXITCODE -eq 0) {
            $lineCount = docker-compose exec -T nginx sh -c "wc -l < /data/ban_list.txt"
            Write-Host "✅ ban_list.txt initialized with $lineCount entries" -ForegroundColor Green
        } else {
            Write-Host "❌ ban_list.txt not found in container!" -ForegroundColor Red
        }
        
        # Check if other files exist
        $files = @("ig_marks.json", "bot_stats.json", "message_mappings.json")
        foreach ($file in $files) {
            $fileExists = docker-compose exec -T nginx test -f "/data/$file"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $file initialized" -ForegroundColor Green
            } else {
                Write-Host "❌ $file not found!" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "❌ Error verifying data initialization: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Function to test the download endpoint
function Test-DownloadEndpoint {
    Write-Host "`n🌐 Testing download endpoint..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/ban_list.txt" -Method Head -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Download endpoint is working (Status: $($response.StatusCode))" -ForegroundColor Green
            Write-Host "📊 Content-Length: $($response.Headers['Content-Length']) bytes" -ForegroundColor Blue
        } else {
            Write-Host "❌ Download endpoint returned status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Download endpoint test failed: $_" -ForegroundColor Red
    }
}

# Function to show container logs
function Show-ContainerLogs {
    Write-Host "`n📋 Recent container logs:" -ForegroundColor Yellow
    
    try {
        Push-Location $dockerComposePath
        
        Write-Host "`n🤖 Discord Bot Logs:" -ForegroundColor Cyan
        docker-compose logs --tail=10 discord_bot
        
        Write-Host "`n🌐 Nginx Logs:" -ForegroundColor Cyan
        docker-compose logs --tail=5 nginx
        
    } catch {
        Write-Host "❌ Error fetching logs: $_" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Main execution
function Main {
    $choice = $args[0]
    
    if (-not $choice) {
        Write-Host "`n🛠️  What would you like to do?" -ForegroundColor Cyan
        Write-Host "1. Full setup (clean + rebuild + start)"
        Write-Host "2. Quick restart (keep volumes)"
        Write-Host "3. Just start containers"
        Write-Host "4. Test current setup"
        Write-Host "5. Show logs"
        Write-Host "0. Exit"
        
        $choice = Read-Host "`nEnter your choice (0-5)"
    }
    
    switch ($choice) {
        "1" {
            Test-Prerequisites
            Stop-ExistingContainers
            Start-Containers
            if (Wait-ForContainers) {
                Test-DataInitialization
                Test-DownloadEndpoint
                Write-Host "`n🎉 Setup complete! Your HITMEN system is ready." -ForegroundColor Green
                Write-Host "📱 Frontend: http://localhost" -ForegroundColor Blue
                Write-Host "📂 Ban List: http://localhost/ban_list.txt" -ForegroundColor Blue
            }
        }
        "2" {
            Test-Prerequisites
            try {
                Push-Location $dockerComposePath
                docker-compose restart
                Write-Host "✅ Containers restarted" -ForegroundColor Green
            } finally {
                Pop-Location
            }
        }
        "3" {
            Test-Prerequisites
            Start-Containers
        }
        "4" {
            Test-DataInitialization
            Test-DownloadEndpoint
        }
        "5" {
            Show-ContainerLogs
        }
        "0" {
            Write-Host "Goodbye! 👋" -ForegroundColor Green
        }
        default {
            Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red
        }
    }
}

# Run the script
if ($args.Count -gt 0) {
    Main $args[0]
} else {
    Main
}
