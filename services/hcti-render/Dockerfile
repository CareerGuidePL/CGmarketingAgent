FROM node:20-slim

# Install Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Use system Chromium instead of bundled one (saves ~200MB)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY server.js .

EXPOSE 3000
USER node
CMD ["node", "server.js"]
