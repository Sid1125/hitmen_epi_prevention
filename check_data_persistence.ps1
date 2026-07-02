# HITMEN Data Persistence Check Script
# This script helps you verify and backup your persistent data

Write-Host "HITMEN - Data Persistence Management" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$dockerComposePath = "D:\hitmen_epi_prevention\src\forum_app\backend"

# Function to check Docker volume
function Check-DockerVolume {
    Write-Host "`nChecking Docker volumes..." -ForegroundColor Yellow
    
    try {
        $volumes = docker volume ls --format "table {{.Name}}" | Select-String "backend_shared_data"
        if ($volumes) {
            Write-Host "✅ Shared data volume exists: $volumes" -ForegroundColor Green
            
            # Check volume details
            docker volume inspect backend_shared_data | ConvertFrom-Json | ForEach-Object {
                Write-Host "📁 Volume path: $($_.Mountpoint)" -ForegroundColor Blue
            }
        } else {
            Write-Host "❌ Shared data volume not found!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error checking Docker volumes: $_" -ForegroundColor Red
    }
}

# Function to check data files in container
function Check-DataFiles {
    Write-Host "`nChecking data files in container..." -ForegroundColor Yellow
    
    try {
        $output = docker-compose -f "$dockerComposePath\docker-compose.yml" exec nginx ls -la /data/
        if ($output -match "ban_list.txt") {
            Write-Host "✅ ban_list.txt found in container" -ForegroundColor Green
        } else {
            Write-Host "❌ ban_list.txt not found in container!" -ForegroundColor Red
        }
        
        if ($output -match "ig_marks.json") {
            Write-Host "✅ ig_marks.json found in container" -ForegroundColor Green
        } else {
            Write-Host "❌ ig_marks.json not found in container!" -ForegroundColor Red
        }
        
        Write-Host "`n📋 Container /data/ contents:" -ForegroundColor Blue
        Write-Host $output
    } catch {
        Write-Host "❌ Error checking container files: $_" -ForegroundColor Red
    }
}

# Function to backup data
function Backup-Data {
    $backupDir = "D:\hitmen_epi_prevention\backups\$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    Write-Host "`nCreating backup at: $backupDir" -ForegroundColor Yellow
    
    try {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Copy files from container
        docker-compose -f "$dockerComposePath\docker-compose.yml" exec nginx cp /data/ban_list.txt /tmp/ban_list_backup.txt
        docker-compose -f "$dockerComposePath\docker-compose.yml" exec nginx cp /data/ig_marks.json /tmp/ig_marks_backup.json
        
        # Copy to host
        docker cp (docker-compose -f "$dockerComposePath\docker-compose.yml" ps -q nginx):/tmp/ban_list_backup.txt "$backupDir\ban_list.txt"
        docker cp (docker-compose -f "$dockerComposePath\docker-compose.yml" ps -q nginx):/tmp/ig_marks_backup.json "$backupDir\ig_marks.json"
        
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error creating backup: $_" -ForegroundColor Red
    }
}

# Function to test container restart
function Test-ContainerRestart {
    Write-Host "`nTesting container restart..." -ForegroundColor Yellow
    
    try {
        # Get file count before restart
        $beforeCount = docker-compose -f "$dockerComposePath\docker-compose.yml" exec nginx sh -c "wc -l < /data/ban_list.txt" | Select-String "\d+" | ForEach-Object { $_.Matches[0].Value }
        Write-Host "📊 Ban list entries before restart: $beforeCount" -ForegroundColor Blue
        
        # Restart containers
        Write-Host "🔄 Restarting containers..." -ForegroundColor Yellow
        docker-compose -f "$dockerComposePath\docker-compose.yml" restart
        
        # Wait for containers to be ready
        Start-Sleep -Seconds 10
        
        # Check file count after restart
        $afterCount = docker-compose -f "$dockerComposePath\docker-compose.yml" exec nginx sh -c "wc -l < /data/ban_list.txt" | Select-String "\d+" | ForEach-Object { $_.Matches[0].Value }
        Write-Host "📊 Ban list entries after restart: $afterCount" -ForegroundColor Blue
        
        if ($beforeCount -eq $afterCount) {
            Write-Host "✅ Data persisted successfully across restart!" -ForegroundColor Green
        } else {
            Write-Host "❌ Data was not persisted properly!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error testing container restart: $_" -ForegroundColor Red
    }
}

# Main menu
do {
    Write-Host "`n🛠️  What would you like to do?" -ForegroundColor Cyan
    Write-Host "1. Check Docker volumes"
    Write-Host "2. Check data files in containers"
    Write-Host "3. Create backup of current data"
    Write-Host "4. Test container restart (with data persistence)"
    Write-Host "5. All checks"
    Write-Host "0. Exit"
    
    $choice = Read-Host "`nEnter your choice (0-5)"
    
    switch ($choice) {
        "1" { Check-DockerVolume }
        "2" { Check-DataFiles }
        "3" { Backup-Data }
        "4" { Test-ContainerRestart }
        "5" { 
            Check-DockerVolume
            Check-DataFiles
            Write-Host "`n💾 Creating backup before any operations..." -ForegroundColor Cyan
            Backup-Data
        }
        "0" { Write-Host "Goodbye! 👋" -ForegroundColor Green }
        default { Write-Host "❌ Invalid choice. Please try again." -ForegroundColor Red }
    }
} while ($choice -ne "0")
