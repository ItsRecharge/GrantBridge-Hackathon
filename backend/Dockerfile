FROM node:18-alpine

WORKDIR /app

# Skip Puppeteer Chromium download to keep image small and builds fast
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy package file
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Default command (can be overridden in docker-compose)
CMD ["npm", "run", "dev"]
