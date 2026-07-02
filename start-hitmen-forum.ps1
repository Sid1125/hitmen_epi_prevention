#!/usr/bin/env powershell

Write-Host "Starting HITMEN Forum Backend..." -ForegroundColor Green

# Navigate to backend directory and run the local start script
Set-Location "src/forum_app/backend"

# Execute the start-forum script
powershell -ExecutionPolicy Bypass -File "start-forum.ps1"

Write-Host "Forum Backend Started!" -ForegroundColor Green

