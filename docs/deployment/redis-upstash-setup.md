# Upstash Redis Setup Guide (Optional Horizontal Scaling)

Upstash Redis is recommended if you scale the backend to multiple Render instances so Socket.IO WebSocket connections can sync across instances.

## Single-Instance Default
For single Render instance deployments, leave `REDIS_ENABLED=false`. All features work out of the box without Redis.

## Enabling Upstash Redis
1. Create a Redis database at [Upstash Console](https://console.upstash.com).
2. Copy the `rediss://...` TLS URL from database details.
3. In Render Environment Variables, set:
   - `REDIS_ENABLED=true`
   - `REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379`
4. Redeploy backend. Socket.IO will automatically use `@socket.io/redis-adapter`.
