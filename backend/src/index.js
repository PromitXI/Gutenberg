const path = require('path');
const fs = require('fs');

// Load .env - search multiple locations
const envPaths = [
  path.resolve(__dirname, '../.env'),       // backend/.env (when cwd is backend)
  path.resolve(__dirname, '../../.env'),     // hld-lld-generator/.env
  path.resolve(__dirname, '../../../.env'),  // workspace root .env
  path.resolve(process.cwd(), '.env'),       // cwd/.env
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`[ENV] Loaded .env from: ${envPath}`);
    break;
  }
}

const express = require('express');
const cors = require('cors');
const generateRouter = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api', generateRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds the 10MB limit',
      type: 'ValidationError'
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: err.message,
      type: 'ValidationError'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    type: err.name || 'Error'
  });
});

app.listen(PORT, () => {
  console.log(`HLD/LLD Generator API running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
