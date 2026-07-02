# HITMEN Development Workflow

## 🚀 Never Face Frontend Update Issues Again!

This document explains the new development workflow that ensures your Docker containers always use the latest frontend changes.

## 📁 Files Created

- `rebuild-containers.ps1` - Complete rebuild with verification
- `quick-update.ps1` - Fast frontend-only updates
- Updated `docker-compose.yml` - Always builds from source
- Updated `frontend.Dockerfile` - Better file handling

## 🛠️ Development Workflow

### When You Make Frontend Changes

#### Option 1: Full Rebuild (Recommended)
```powershell
.\rebuild-containers.ps1
```
**What it does:**
- Stops all containers
- Cleans Docker cache
- Rebuilds frontend from latest source
- Starts all containers
- Verifies all services are working
- Shows status and helpful tips

#### Option 2: Quick Update (Faster)
```powershell
.\quick-update.ps1
```
**What it does:**
- Only rebuilds frontend container
- Restarts frontend and nginx
- Faster but less thorough

#### Option 3: Force Full Rebuild
```powershell
.\quick-update.ps1 -FullRebuild
```
Same as Option 1 but called from quick-update script.

### When You Make Backend/Bot Changes

Just use the normal docker-compose commands:
```powershell
cd src\forum_app\backend
docker-compose down
docker-compose build api discord_bot
docker-compose up -d
```

## 🔧 How It Works

### The Problem (Fixed)
- Docker volume wasn't updating with new frontend builds
- Had to manually copy files or rebuild multiple times
- Inconsistent behavior between local dev and Docker

### The Solution
1. **Updated docker-compose.yml**: Always builds frontend from source
2. **Enhanced Dockerfile**: Better file permissions and verification
3. **Automation scripts**: Handle the complete rebuild process
4. **Verification**: Scripts check that services are working

## 📋 Quick Reference

| Task | Command | Use When |
|------|---------|----------|
| Frontend changes | `.\rebuild-containers.ps1` | After editing React/TypeScript files |
| Backend changes | `docker-compose build api && docker-compose restart api` | After editing Python API code |
| Bot changes | `docker-compose build discord_bot && docker-compose restart discord_bot` | After editing bot.js |
| Full reset | `.\rebuild-containers.ps1` | When things aren't working |

## 🎯 Services & URLs

After running the rebuild script:
- **Frontend**: http://localhost
- **Operations**: http://localhost/operations  
- **Ban List**: http://localhost/ban_list.txt
- **API**: http://localhost:8000

## 💡 Tips

1. **Always clear browser cache** after rebuilds (Ctrl+F5)
2. **Use incognito mode** for testing to avoid cache issues
3. **Check browser console** (F12) for debugging download issues
4. **Run rebuild script** anytime you're unsure if changes took effect

## 🐛 Troubleshooting

### If containers won't start:
```powershell
docker-compose down -v
docker system prune -f
.\rebuild-containers.ps1
```

### If download still doesn't work:
1. Check browser console (F12) for errors
2. Verify ban list endpoint: http://localhost/ban_list.txt
3. Clear browser cache completely

### If you see old frontend:
1. Run `.\rebuild-containers.ps1`
2. Open site in incognito mode
3. Check if files updated: `docker-compose exec nginx ls -la /usr/share/nginx/html/`

## 🎉 Benefits

- ✅ No more frontend update headaches
- ✅ Automated verification of services
- ✅ Clear feedback on what's working
- ✅ Consistent development experience
- ✅ Easy troubleshooting
