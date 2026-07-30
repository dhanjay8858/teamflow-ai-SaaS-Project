# TeamFlow AI — Local Development Guide

This guide covers running TeamFlow AI locally using either Docker Compose or direct Node.js processes.

---

## Option A: Docker Compose (Recommended)

Docker Compose starts all services (MongoDB, Redis, Backend, Frontend) with a single command.

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2+

### Quick Start
```bash
# 1. Clone repo
git clone https://github.com/YOUR_ORG/teamflow-ai.git
cd teamflow-ai

# 2. Copy server env file
cp server/.env.example server/.env

# 3. Start full stack in background
docker-compose up -d

# 4. View logs
docker-compose logs -f server
```

### URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Healthcheck: `http://localhost:5000/health`
- Metrics: `http://localhost:5000/metrics`
- MongoDB: `mongodb://localhost:27017/teamflow`
- Redis: `redis://localhost:6379`

### Useful Commands
```bash
# Stop all services
docker-compose down

# Rebuild images after dependency changes
docker-compose up -d --build

# Run backend tests inside container
docker-compose exec server npm test
```

---

## Option B: Native Node.js Development

### Prerequisites
- Node.js v20.x
- MongoDB running locally on port 27017 (or MongoDB Atlas connection string)
- Redis running locally on port 6379 (optional)

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```
Access app at `http://localhost:3000`.
