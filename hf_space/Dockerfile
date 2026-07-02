FROM python:3.11

RUN apt-get update && apt-get install -y \
    curl \
    dos2unix \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/forum_app/backend/ .

RUN mkdir -p /data
ENV NODE_ENV=production

WORKDIR /bot
COPY discord_bot/package*.json ./
RUN npm ci --only=production
COPY discord_bot/bot.js discord_bot/init-data.js ./

WORKDIR /code

COPY hf_space/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY hf_space/startup.py /code/hf_startup.py
COPY hf_space/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860

CMD ["/entrypoint.sh"]
