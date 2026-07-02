# Test Frontend Build Script
# This script tests building the frontend in Docker

Write-Host "Testing Frontend Build in Docker..." -ForegroundColor Cyan

# Step 1: Build the frontend container
Write-Host "`nBuilding frontend container..." -ForegroundColor Yellow
try {
    docker build -f frontend.Dockerfile -t hitmen-frontend .
    Write-Host "✅ Frontend container built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build frontend container: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Run the container to build the app
Write-Host "`nBuilding React app in container..." -ForegroundColor Yellow
try {
    # Create a temporary container to build the app
    docker run --rm -v ${PWD}/dist:/code/dist hitmen-frontend
    Write-Host "✅ React app built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build React app: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Check if dist directory was created
Write-Host "`nChecking build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
    Write-Host "✅ dist/ directory created with $fileCount files" -ForegroundColor Green
} else {
    Write-Host "❌ dist/ directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Frontend build test completed successfully!" -ForegroundColor Green
Write-Host "You can now run the full stack with: docker-compose -f src/forum_app/backend/docker-compose.yml up -d" -ForegroundColor Cyan 