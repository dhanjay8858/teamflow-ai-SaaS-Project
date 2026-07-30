# TeamFlow AI — Vercel Deployment Guide

Deploying the React + Vite frontend of TeamFlow AI to Vercel.

---

## Step-by-Step Deployment

### 1. Import Repository
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `teamflow-ai` repository.

### 2. Configure Framework & Root Directory
- **Framework Preset**: Vite
- **Root Directory**: `client`

### 3. Build & Output Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

### 4. Environment Variables
Add the following in **Environment Variables**:

| Key | Example Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://teamflow-backend.onrender.com/api/v1` | Backend API URL |
| `VITE_SOCKET_URL` | `https://teamflow-backend.onrender.com` | Backend WebSocket URL |

### 5. Deploy
Click **Deploy**. Vercel will automatically build static assets and deploy to your project URL (e.g. `https://teamflow-ai.vercel.app`).

---

## SPA Routing Note
`vercel.json` included in `client/vercel.json` ensures all nested client routes (e.g. `/organizations/123/projects`) rewrite to `/index.html` on browser refresh.
