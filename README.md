# Gutenberg

AI-powered HLD/LLD document generation platform for the NTT Public Cloud Team.

Gutenberg ingests SOW documents (`.pdf`, `.docx`, `.txt`), extracts technical and project context with Gemini, and produces structured Word deliverables for:
- `HLD` (High-Level Design)
- `LLD` (Low-Level Design)
- `AWS` and `Azure` delivery models

## Table of Contents
- Overview
- Architecture
- Features
- Prerequisites
- Quick Start
- Configuration
- API Endpoints
- Project Structure
- Troubleshooting
- Security Notes
- License

## Overview
Gutenberg solves manual document preparation for cloud infrastructure engagements by automating:
1. SOW parsing
2. AI requirement extraction
3. Standardized document composition
4. Download-ready DOCX generation

The frontend contains:
1. A branded marketing landing page
2. The document generation workspace (`#/app`)

## Architecture
```text
Frontend (React + Vite)
  -> POST /api/generate (multipart/form-data)
Backend (Express)
  -> Parse input file (PDF/DOCX/TXT)
  -> Analyze with Gemini
  -> Normalize data model
  -> Build DOCX (docx library)
  -> Save in outputs/
  -> Return download URL
Frontend
  -> GET /api/download/:filename
```

Core backend modules:
- `backend/src/routes/generate.js` - upload, validation, generation, download endpoints
- `backend/src/services/sowParser.js` - file parsing + AI pipeline entry
- `backend/src/services/geminiService.js` - Gemini prompt/response handling
- `backend/src/services/templateProcessor.js` - HLD/LLD section generation
- `backend/src/utils/docxBuilder.js` - Word document styles/content builder

## Features

### Input & Validation
- Supported formats: `.pdf`, `.docx`, `.txt`
- Max file size: `10MB` (configurable)
- Required metadata:
  - `projectName`
  - `clientName`
  - `authorName`

### AI Enrichment
- Extracts and structures:
  - executive summary
  - scope (in/out)
  - requirements
  - assumptions
  - constraints and risks
  - RACI
  - network design, VPN, security controls
  - migration and DR strategy
  - workloads, SLA, compliance

### Output Generation
- DOCX output with consistent formatting
- Platform-aware sections (`AWS`/`Azure`)
- Separate templates for `HLD` and `LLD`
- Download endpoint for generated files

### Frontend UX
- Drag-and-drop upload
- Progress states and retry
- Branded landing page with navigation sections
- Workspace view with generation controls

## Prerequisites
- Node.js `18+` recommended
- npm
- Python `3.9+` (for `start.py` convenience launcher)
- Gemini API key

## Quick Start

### Option A: One-command startup (recommended)
From repo root:
```bash
python start.py
```
This:
1. Installs missing backend/frontend dependencies
2. Starts backend on `http://localhost:3001`
3. Starts frontend on `http://localhost:5173`

### Option B: Manual startup
Backend:
```bash
cd backend
npm install
npm start
```

Frontend (new terminal):
```bash
cd frontend
npm install
npm run dev
```

## Configuration

### Backend env vars
Place in `backend/.env` (or root `.env`):

```env
PORT=3001
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
MAX_FILE_SIZE=10485760
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash-preview-04-17
```

Notes:
- `GOOGLE_API_KEY` is also accepted as fallback.
- `MAX_FILE_SIZE` is in bytes.

### Frontend env vars
Optional file: `frontend/.env`
```env
VITE_API_URL=http://localhost:3001
```

If omitted, frontend uses relative paths.

## API Endpoints
See full contract in `docs/API.md`.

Quick reference:
- `GET /api/health`
- `POST /api/generate`
- `GET /api/download/:filename`

## Project Structure
```text
hld-lld-generator/
  backend/
    src/
      routes/
      services/
      utils/
  frontend/
    public/
    src/
      components/
      services/
  templates/
  examples/
  start.py
```

## Troubleshooting

### 1) Generation fails with API key error
Check:
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` is set
- backend process restarted after env changes

### 2) Upload rejected
Check:
- extension is `.pdf`, `.docx`, or `.txt`
- file size <= configured max

### 3) Cannot download generated file
Check:
- backend is running
- file exists in `outputs/`
- URL from response is unchanged

### 4) `Cannot read properties of undefined (...)`
This usually indicates missing or malformed extracted data from input/AI output.
Recommended actions:
1. Retry with clearer SOW content
2. Ensure required project metadata is filled
3. Check backend logs for the exact field and stack trace

## Security Notes
- Never commit real API keys into git.
- `.env` is ignored by default.
- Validate and sanitize uploaded documents in production environments.
- Use HTTPS and authenticated access for production deployment.

## Documentation Index
- API: `docs/API.md`
- Deployment: `docs/DEPLOYMENT.md`

## License
See `LICENSE`.
