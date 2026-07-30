# Production Troubleshooting Guide

### 1. Cross-Origin Cookie Auth Failure (Vercel -> Render)
- **Symptom**: User logs in, but sub-sequent requests return 401 Unauthorized.
- **Cause**: Cookies blocked by browser due to missing `sameSite: none` or `secure: true`.
- **Fix**: Ensure backend `cookie.config.ts` uses `sameSite: 'none'` and `secure: true` in production (HTTPS). Ensure frontend requests set `withCredentials: true` (Axios default in `api.client.ts`).

### 2. React Router 404 on Refresh (Vercel)
- **Symptom**: Refreshing `/organizations` yields Vercel 404.
- **Fix**: Check `client/vercel.json` contains rewrites matching `((?!assets|...).*) -> /index.html`.

### 3. MongoDB Connection Timeout on Render
- **Symptom**: Backend logs `MongoDB connection error`.
- **Fix**: In MongoDB Atlas Network Access, ensure IP `0.0.0.0/0` is added so Render's dynamic outbound IPs can connect.

### 4. Health Endpoint 503
- **Symptom**: `/health` returns 503 Unhealthy.
- **Fix**: Check response payload JSON. It details whether MongoDB or Redis is disconnected.
