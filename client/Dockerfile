# ─────────────────────────────────────────────────────────────
# Stage 1: Builder — compile and bundle React app with Vite
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SOCKET_URL=http://localhost:5000

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production — nginx serving static assets
# ─────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
