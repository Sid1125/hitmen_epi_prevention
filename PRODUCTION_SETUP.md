# HITMEN Production Setup Guide

This guide explains how the Discord bot and website work together in production with nginx serving static files.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord Bot   │    │   FastAPI API   │    │   React App     │
│                 │    │                 │    │                 │
│ • Monitors      │    │ • Forum backend │    │ • Built static  │
│   Discord       │    │ • User auth     │    │   files         │
│ • Saves to      │    │ • Posts/comments│    │ • Served by     │
│   ig_marks.json │    │ • REST API      │    │   nginx         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx       │
                    │                 │
                    │ • Serves static │
                    │   files         │
                    │ • Proxies API   │
                    │ • Serves        │
                    │   ig_marks.json │
                    └─────────────────┘
```

## 📁 File Flow

### 1. Discord Bot → JSON File
```
Discord Channel → Bot → /data/ig_marks.json
```

### 2. JSON File → Website
```
/data/ig_marks.json → Nginx → http://localhost/ig_marks.json → React App
```

### 3. Built Website
```
npm run build → /dist/ → Nginx → http://localhost
```

## 🔧 Production Setup

### Step 1: Build the Frontend
```powershell
npm run build
```
This creates static files in the `dist/` directory.

### Step 2: Start Production Stack
```powershell
.\start-production.ps1
```

### Step 3: Verify Everything Works
```powershell
.\test-discord-bot.ps1
```

## 🐳 Docker Services in Production

### Frontend Service
- **Purpose**: Builds the React app
- **Command**: `npm run build`
- **Output**: Static files in `dist/` directory
- **No ports exposed** (only builds, doesn't serve)

### Nginx Service
- **Purpose**: Serves static files and proxies API
- **Port**: `80`
- **Volumes**:
  - `../../../dist:/usr/share/nginx/html` (built React app)
  - `shared_data:/data` (ig_marks.json)
- **Routes**:
  - `/` → Serves static files from `/usr/share/nginx/html`
  - `/api/*` → Proxies to FastAPI backend
  - `/ig_marks.json` → Serves from `/data/ig_marks.json`

### Discord Bot Service
- **Purpose**: Monitors Discord and saves usernames
- **Volumes**: `shared_data:/data` (writes to ig_marks.json)
- **Environment**: DISCORD_TOKEN, TARGET_CHANNEL_ID

## ✅ Will It Work?

### Yes! Here's why:

1. **JSON File Access**: ✅
   - Discord bot writes to `/data/ig_marks.json`
   - Nginx serves it at `http://localhost/ig_marks.json`
   - React app fetches from the same domain

2. **Website Data Loading**: ✅
   - Built React app is served by nginx
   - Same-origin requests work perfectly
   - No CORS issues

3. **Real-time Updates**: ✅
   - Discord bot continuously monitors
   - JSON file updates immediately
   - Website refreshes every 5 minutes

## 🔄 Data Flow Example

### 1. User posts in Discord:
```
"Check out https://instagram.com/malicious_user"
```

### 2. Discord bot processes:
```
📨 New message from User#1234: Check out https://instagram.com/malicious_user...
🎯 Found Instagram usernames: malicious_user
✅ Updated /data/ig_marks.json with 1 new usernames
📊 Total marks: 15
```

### 3. JSON file updates:
```json
[
  "example_user_1",
  "example_user_2", 
  "malicious_user",
  "spam_account_1"
]
```

### 4. Website displays:
- Marks Gallery shows the new username
- Statistics update automatically
- Direct link to Instagram profile works

## 🚀 Production Commands

### Start Everything
```powershell
.\start-production.ps1
```

### Check Status
```powershell
.\test-discord-bot.ps1
```

### View Logs
```powershell
docker-compose -f src/forum_app/backend/docker-compose.yml logs -f
```

### Restart Bot Only
```powershell
docker-compose -f src/forum_app/backend/docker-compose.yml restart discord_bot
```

### Stop Everything
```powershell
docker-compose -f src/forum_app/backend/docker-compose.yml down
```

## 🔧 Configuration Files

### Nginx Configuration
- **File**: `src/forum_app/nginx/nginx.conf`
- **Purpose**: Routes requests to correct services
- **Key**: Serves `/ig_marks.json` from shared volume

### Docker Compose
- **File**: `src/forum_app/backend/docker-compose.yml`
- **Purpose**: Orchestrates all services
- **Key**: Shared volume `shared_data:/data`

### React App
- **File**: `src/pages/MarksGallery.tsx`
- **Purpose**: Fetches and displays marks
- **Key**: Fetches from `/ig_marks.json` on same domain

## 🧪 Testing the Setup

### Test 1: Discord Bot
1. Post Instagram usernames in Discord
2. Check bot logs for confirmation
3. Verify JSON file updates

### Test 2: Website Display
1. Visit `http://localhost`
2. Navigate to "Marks Gallery"
3. Verify usernames appear
4. Check statistics update

### Test 3: Direct JSON Access
1. Visit `http://localhost/ig_marks.json`
2. Verify JSON is accessible
3. Check content is current

## 🚨 Troubleshooting

### Website Not Loading
- Check nginx container is running
- Verify `dist/` directory exists
- Check nginx logs

### JSON File Not Accessible
- Check shared volume is mounted
- Verify Discord bot is writing to file
- Check nginx configuration

### Discord Bot Not Working
- Verify environment variables
- Check bot token is valid
- Ensure channel ID is correct

### API Not Working
- Check FastAPI container is running
- Verify database is accessible
- Check API logs

## 🎉 Success Indicators

✅ **Discord bot online**: `🤖 Bot is online as HITMEN Bot#1234`

✅ **JSON file accessible**: `http://localhost/ig_marks.json` returns valid JSON

✅ **Website loads**: `http://localhost` shows HITMEN homepage

✅ **Marks display**: Marks Gallery shows Instagram usernames

✅ **Real-time updates**: New Discord posts appear on website within 5 minutes

## 📊 Monitoring

### Key URLs to Monitor
- `http://localhost` - Main website
- `http://localhost/ig_marks.json` - Marks data
- `http://localhost/api/health` - API health

### Key Logs to Watch
- Discord bot logs: `docker-compose logs -f discord_bot`
- Nginx logs: `docker-compose logs -f nginx`
- API logs: `docker-compose logs -f api`

The production setup is fully functional and will work exactly as designed! 🚀 