# Deployment Guide

This guide provides practical deployment options for Gutenberg.

## 1) Environment Setup

Required:
- Node.js 18+
- npm
- Gemini API key

Set backend variables (example):
```env
PORT=3001
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
MAX_FILE_SIZE=10485760
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-preview-04-17
```

Set frontend API target (optional):
```env
VITE_API_URL=https://your-api-domain
```

## 2) Build

Frontend:
```bash
cd frontend
npm ci
npm run build
```

Backend:
```bash
cd backend
npm ci
```

## 3) Run in Production

Backend:
```bash
cd backend
npm start
```

Frontend static hosting options:
1. Serve `frontend/dist` from Nginx/Apache
2. Host on static platforms (Netlify/Vercel/S3 + CloudFront)

## 4) Reverse Proxy (Recommended)

Use Nginx to:
1. Serve frontend static assets
2. Route `/api/*` to backend
3. Enforce HTTPS

Example routing strategy:
- `/` -> frontend files
- `/api/` -> `http://localhost:3001/api/`

## 5) Persistence Considerations

Current storage is local filesystem:
- uploads in `uploads/`
- generated docs in `outputs/`

For scalable deployments, use:
1. Object storage (e.g., S3/Azure Blob)
2. Job queue for long-running generation
3. Retention cleanup jobs

## 6) Operational Recommendations

1. Add authentication for all document APIs.
2. Add request logging and tracing.
3. Add rate limits on upload endpoint.
4. Add antivirus scan pipeline for uploads.
5. Add monitoring/alerts for backend process and disk usage.

## 7) CI/CD Checklist

1. Run `npm ci` for backend/frontend.
2. Run frontend build.
3. Verify environment variables exist.
4. Deploy backend and frontend.
5. Run post-deploy health check (`/api/health`).
