# TeamFlow AI — Render Deployment Guide

Deploying the Express + Node.js backend of TeamFlow AI to Render.

---

## Step-by-Step Deployment

### Method A: Blueprint Deployment (Recommended)
1. Push code to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Select your `teamflow-ai` repository.
5. Render reads `render.yaml` automatically and provisions the web service.
6. Fill in the missing secret environment variables in the Dashboard.

### Method B: Manual Web Service
1. Click **New +** -> **Web Service**.
2. **Root Directory**: `server`
3. **Environment**: Node
4. **Build Command**: `npm ci && npm run build`
5. **Start Command**: `node dist/server.js`
6. **Health Check Path**: `/health`

---

## Required Environment Variables in Render

Set these in **Environment -> Add Environment Variable**:

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app.vercel.app` (Vercel domain) |
| `MONGODB_URI` | MongoDB Atlas Connection String |
| `JWT_ACCESS_SECRET` | Secret key (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret key (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `GROQ_API_KEY` | Primary LLM Key |
| `GEMINI_API_KEY` | Fallback LLM Key |

---

## Health Checks & Zero-Downtime
Render calls `/health` every 30 seconds. New deployments only receive traffic once `/health` returns `HTTP 200 OK`.
