# Environment Variables Reference

Complete list of all environment variables for TeamFlow AI.

## Server Variables

| Variable | Default / Required | Description |
|---|---|---|
| `NODE_ENV` | `development` / `production` | Execution environment |
| `PORT` | `5000` | HTTP server port |
| `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origins (comma-separated for multiple) |
| `MONGODB_URI` | Required | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Required | Secret for signing access tokens (min 16 chars) |
| `JWT_REFRESH_SECRET` | Required | Secret for signing refresh tokens (min 16 chars) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifespan |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret |
| `REDIS_ENABLED` | `false` | Enable Redis adapter and cache |
| `REDIS_URL` | Optional | Redis connection URL (`rediss://...`) |
| `LOG_LEVEL` | `info` | Logging verbosity (`error`, `warn`, `info`, `debug`) |
| `METRICS_ENABLED` | `true` | Enable `/metrics` Prometheus endpoint |
| `GROQ_API_KEY` | Optional | Groq LLM API Key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model identifier |
| `GEMINI_API_KEY` | Optional | Google Gemini API Key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model identifier |
| `LLM_PROVIDER` | `groq` | Primary LLM provider (`groq`, `gemini`, `ollama`) |

## Client Variables

| Variable | Default / Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL for API requests |
| `VITE_SOCKET_URL` | `http://localhost:5000` | Base URL for WebSocket connection |
