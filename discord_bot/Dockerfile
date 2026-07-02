FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy bot source code and initialization script
COPY bot.js ./
COPY init-data.js ./

# Create data directory
RUN mkdir -p /data

# Set environment variables
ENV NODE_ENV=production

# Run initialization then bot
CMD ["sh", "-c", "node init-data.js && node bot.js"]
