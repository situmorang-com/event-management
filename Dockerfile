# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Generate drizzle types and build the app
RUN npm run db:generate && npm run build && npm prune --production

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY docker-start.sh ./

# Create data directory for SQLite
RUN mkdir -p data && chmod +x docker-start.sh

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["./docker-start.sh"]
