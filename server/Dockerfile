# ─────────────────────────────────────────────────────────────
# Stage 1: Builder — compile TypeScript to JavaScript
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and compile
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production — minimal Node.js runtime image
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Security: Install curl for health checks, then drop privileges
RUN apk add --no-cache curl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S teamflow -u 1001

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER teamflow

EXPOSE 5000

# Health check — Render and Kubernetes compatible
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
