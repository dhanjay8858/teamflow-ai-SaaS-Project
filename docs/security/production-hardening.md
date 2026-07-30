# Production Security & Hardening Checklist

### 1. Authentication & Cookie Hardening
- [x] JWT secrets must be >= 32 hex characters in production.
- [x] Access cookies use `httpOnly: true`, `secure: true`, `sameSite: 'none'` for cross-domain Vercel -> Render auth.
- [x] Passwords hashed with `bcryptjs` (salt rounds 10).
- [x] Token expiration: Access token (15m), Refresh token (7d).

### 2. Network & Headers Security
- [x] `helmet()` security headers configured (CSP, HSTS, frameguard, XSS protection).
- [x] CORS configured with explicit allowed origins (`CLIENT_URL`).
- [x] Reverse proxy trust (`app.set('trust proxy', 1)`) enabled for Render rate limiting.
- [x] Rate limiters active on Auth, File Upload, and Org Creation endpoints (`express-rate-limit`).

### 3. Data & Observability Security
- [x] Sensitive fields (`password`, `token`, `secret`, `cookie`) redacted from structured logs.
- [x] Error stack traces hidden from HTTP error responses in production (`NODE_ENV === 'production'`).
- [x] Request correlation ID (`X-Request-ID`) attached to logs for error tracing.
