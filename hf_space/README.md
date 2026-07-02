# HITMEN Backend API

**Docker build config for `hf_space/Dockerfile`**

FastAPI backend + Discord bot for the HITMEN EPI Prevention Mission.

## Services
- **FastAPI**: REST API for forum and marks data
- **Discord Bot**: Monitors Discord for Instagram marks
- **PostgreSQL**: Database for forum posts

## Environment Variables (HF Space Secrets)
| Key | Description |
|-----|-------------|
| `DISCORD_TOKEN` | Discord bot token |
| `TARGET_CHANNEL_ID` | Discord channel to monitor |
| `DATABASE_URL` | PostgreSQL connection string (optional) |
