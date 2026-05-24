FROM node:20-alpine

WORKDIR /app

# Install prod deps first for better caching
COPY package*.json ./
RUN npm install --production

COPY . .

# Run as non-root user for security
RUN addgroup -S app && adduser -S app -G app
USER app

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]

