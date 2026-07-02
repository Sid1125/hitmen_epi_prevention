---
title: HITMEN Backend
emoji: 🎯
colorFrom: gray
colorTo: red
sdk: docker
app_port: 7860
pinned: false
license: other
---

# HITMEN Backend API

FastAPI backend + Discord bot for the HITMEN EPI Prevention Mission.

## Services
- **FastAPI**: REST API for forum and marks data
- **Discord Bot**: Monitors Discord for Instagram marks
- **PostgreSQL**: Database for forum posts

## Environment Variables
Set these in HF Space settings:
- `DISCORD_TOKEN` - Discord bot token
- `TARGET_CHANNEL_ID` - Discord channel to monitor
- `DATABASE_URL` - PostgreSQL connection string
