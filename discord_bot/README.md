# HITMEN Discord Bot

A Discord bot that monitors specified channels for Instagram usernames and saves them to a shared JSON file for display on the HITMEN website.

## Features

- 🔍 **Instagram Username Detection**: Extracts usernames from various formats:
  - Full Instagram URLs: `https://instagram.com/username`
  - @ mentions: `@username`
  - Plain usernames: `username`
- 💾 **Persistent Storage**: Saves usernames to `/data/ig_marks.json`
- 🔄 **Deduplication**: Automatically removes duplicates
- 📊 **Real-time Updates**: Processes messages as they arrive
- 🤖 **Discord Integration**: Responds with confirmation messages

## Setup

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Enable these intents:
   - Message Content Intent
   - Server Members Intent
   - Presence Intent

### 2. Bot Permissions

Add the bot to your server with these permissions:
- Read Messages/View Channels
- Send Messages
- Read Message History

### 3. Environment Variables

Set these environment variables:

```bash
DISCORD_TOKEN=your_bot_token_here
TARGET_CHANNEL_ID=your_channel_id_here
```

### 4. Channel ID

To get your channel ID:
1. Enable Developer Mode in Discord (User Settings > Advanced)
2. Right-click on the target channel
3. Select "Copy ID"

## Usage

### Local Development

```bash
cd discord_bot
npm install
npm start
```

### Docker

```bash
docker build -t hitmen-discord-bot .
docker run -e DISCORD_TOKEN=your_token -e TARGET_CHANNEL_ID=your_channel_id hitmen-discord-bot
```

### Docker Compose

The bot is integrated into the main docker-compose.yml file and will start automatically with the rest of the HITMEN stack.

## File Structure

```
discord_bot/
├── bot.js              # Main bot logic
├── package.json        # Dependencies
├── Dockerfile          # Container configuration
├── ig_marks.json      # Sample marks file
└── README.md          # This file
```

## Output

The bot saves Instagram usernames to `/data/ig_marks.json` in this format:

```json
[
  "username1",
  "username2",
  "malicious_account"
]
```

## Integration

The `ig_marks.json` file is mounted and served by Nginx at:
- URL: `http://localhost/ig_marks.json`
- Used by the frontend to display marks

## Monitoring

The bot logs:
- ✅ Startup confirmation
- 📨 New messages processed
- 🎯 Instagram usernames found
- ✅ File updates
- ❌ Errors

## Security

- Bot only processes messages from the specified channel
- Ignores messages from other bots
- Validates usernames before saving
- Uses environment variables for sensitive data

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check bot token is correct
   - Verify bot has proper permissions
   - Ensure intents are enabled

2. **No usernames detected**
   - Check channel ID is correct
   - Verify message format
   - Check bot logs for errors

3. **File not updating**
   - Check `/data` directory permissions
   - Verify volume mounting in Docker

### Logs

Monitor bot logs for:
- `🤖 Bot is online` - Successful startup
- `📨 New message` - Message processing
- `🎯 Found Instagram usernames` - Username detection
- `✅ Updated` - File save confirmation
- `❌ Error` - Issues to investigate 