# HITMEN Discord Bot Setup Guide

This guide will help you set up the Discord bot to monitor Instagram usernames and display them on your HITMEN website.

## 🎯 Overview

The Discord bot monitors a specified Discord channel for Instagram usernames and saves them to a shared JSON file that's displayed on the Marks Gallery page.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Discord account with server access
- Discord bot token (see setup below)

## 🔧 Step 1: Discord Bot Setup

### 1.1 Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "HITMEN Bot" or similar
4. Click "Create"

### 1.2 Create Bot

1. In your application, go to "Bot" section
2. Click "Add Bot"
3. Copy the bot token (you'll need this later)
4. Enable these intents:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
   - ✅ Presence Intent

### 1.3 Bot Permissions

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Read Message History
4. Copy the generated URL and add the bot to your server

### 1.4 Get Channel ID

1. Enable Developer Mode in Discord:
   - User Settings > Advanced > Developer Mode
2. Right-click on the target channel
3. Select "Copy ID"
4. Save this ID for later

## 🔧 Step 2: Environment Setup

### 2.1 Set Environment Variables

Create a `.env` file in the project root or set environment variables:

```bash
# Windows PowerShell
$env:DISCORD_TOKEN="your_bot_token_here"
$env:TARGET_CHANNEL_ID="your_channel_id_here"

# Or create .env file
DISCORD_TOKEN=your_bot_token_here
TARGET_CHANNEL_ID=your_channel_id_here
```

### 2.2 Verify Setup

Run the startup script to verify configuration:

```powershell
.\start-discord-bot.ps1
```

## 🔧 Step 3: Start the System

### 3.1 Start All Services

```powershell
# Start the entire HITMEN stack including Discord bot
docker-compose -f src/forum_app/backend/docker-compose.yml up -d
```

### 3.2 Verify Bot Status

```powershell
# Check bot logs
docker-compose -f src/forum_app/backend/docker-compose.yml logs -f discord_bot
```

You should see:
```
🤖 Bot is online as HITMEN Bot#1234
📡 Monitoring channel: 1234567890123456789
💾 Saving marks to: /data/ig_marks.json
```

## 🧪 Step 4: Testing

### 4.1 Test Bot Response

1. Go to your Discord server
2. Send a message in the monitored channel with Instagram usernames:
   ```
   Check out these accounts:
   https://instagram.com/malicious_user1
   @spam_account_2
   fake_profile_3
   ```

3. The bot should respond with:
   ```
   🎯 Added 3 new Instagram mark(s): malicious_user1, spam_account_2, fake_profile_3
   ```

### 4.2 Verify Website Display

1. Open your website: `http://localhost`
2. Navigate to "Marks Gallery"
3. You should see the Instagram usernames displayed as marks

## 📊 Monitoring

### Bot Logs

```powershell
# Real-time logs
docker-compose -f src/forum_app/backend/docker-compose.yml logs -f discord_bot

# Recent logs
docker-compose -f src/forum_app/backend/docker-compose.yml logs discord_bot
```

### File Monitoring

The bot saves usernames to `/data/ig_marks.json` which is accessible at:
- `http://localhost/ig_marks.json`

### Website Integration

The Marks Gallery page automatically:
- Fetches data from `/ig_marks.json`
- Refreshes every 5 minutes
- Shows real-time statistics
- Provides direct links to Instagram profiles

## 🔧 Configuration Options

### Bot Configuration

Edit `discord_bot/bot.js` to modify:

- **Username patterns**: Update regex patterns in `extractInstagramUsernames()`
- **Response messages**: Modify confirmation messages
- **File location**: Change `IG_FILE` path
- **Validation rules**: Adjust username validation logic

### Website Configuration

Edit `src/pages/MarksGallery.tsx` to modify:

- **Refresh interval**: Change the 5-minute refresh timer
- **Status assignment**: Modify how statuses are assigned to usernames
- **Display format**: Customize the mark card appearance

## 🚨 Troubleshooting

### Common Issues

#### Bot Not Responding
- ✅ Check bot token is correct
- ✅ Verify bot has proper permissions
- ✅ Ensure intents are enabled
- ✅ Check channel ID is correct

#### No Usernames Detected
- ✅ Verify message format
- ✅ Check bot logs for errors
- ✅ Test with simple usernames first

#### Website Not Updating
- ✅ Check nginx configuration
- ✅ Verify file permissions
- ✅ Test direct access to `/ig_marks.json`

#### Docker Issues
- ✅ Check Docker is running
- ✅ Verify docker-compose.yml syntax
- ✅ Check container logs

### Debug Commands

```powershell
# Check bot container status
docker ps | findstr discord_bot

# Check file contents
docker exec -it $(docker ps -q --filter "name=discord_bot") cat /data/ig_marks.json

# Restart bot only
docker-compose -f src/forum_app/backend/docker-compose.yml restart discord_bot

# Rebuild bot
docker-compose -f src/forum_app/backend/docker-compose.yml build discord_bot
```

## 🔒 Security Considerations

- **Bot Token**: Keep your Discord bot token secure
- **Channel Access**: Only add bot to channels you want monitored
- **File Permissions**: Ensure `/data` directory has proper permissions
- **Rate Limiting**: Bot respects Discord's rate limits automatically

## 📈 Scaling

### Multiple Channels

To monitor multiple channels, modify the bot:

```javascript
const CHANNEL_IDS = process.env.TARGET_CHANNEL_IDS.split(',');
```

### Multiple Servers

Create separate bot instances for different servers with different tokens.

### Backup

The `ig_marks.json` file is persisted in a Docker volume and survives container restarts.

## 🎉 Success!

Your Discord bot is now:
- ✅ Monitoring Discord for Instagram usernames
- ✅ Saving marks to shared JSON file
- ✅ Displaying marks on your website
- ✅ Providing real-time updates

The system is fully automated and will continue monitoring and updating as new Instagram usernames are posted in your Discord channel. 