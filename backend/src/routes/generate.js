const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const TemplateProcessor = require('../services/templateProcessor');

const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '../../..', process.env.UPLOAD_DIR || 'uploads');
const OUTPUT_DIR = path.resolve(__dirname, '../../..', process.env.OUTPUT_DIR || 'outputs');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760;

// Ensure directories exist
[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${ext}. Allowed: ${allowed.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

// POST /api/generate
router.post('/generate', upload.single('sowFile'), async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No SOW file uploaded' });
    }
    uploadedFilePath = req.file.path;

    const { platform, documentType, additionalInfo } = req.body;

    // Parse projectDetails from JSON string
    let projectDetails;
    try {
      projectDetails = JSON.parse(req.body.projectDetails);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid projectDetails format' });
    }

    // Validation
    if (!platform || !['aws', 'azure'].includes(platform)) {
      return res.status(400).json({ success: false, error: 'Invalid platform. Must be "aws" or "azure"' });
    }
    if (!documentType || !['hld', 'lld'].includes(documentType)) {
      return res.status(400).json({ success: false, error: 'Invalid documentType. Must be "hld" or "lld"' });
    }
    if (!projectDetails.projectName || !projectDetails.clientName || !projectDetails.authorName) {
      return res.status(400).json({ success: false, error: 'projectName, clientName, and authorName are required' });
    }

    // Process and generate document
    const processor = new TemplateProcessor();
    const buffer = await processor.process({
      sowFilePath: uploadedFilePath,
      platform,
      documentType,
      additionalInfo: additionalInfo || '',
      projectDetails
    });

    // Save to output directory
    const safeName = projectDetails.projectName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const version = projectDetails.version || '1.0';
    const outputFilename = `${uuidv4()}_${safeName}_${documentType.toUpperCase()}_v${version}.docx`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    fs.writeFileSync(outputPath, buffer);

    // Clean up uploaded file
    if (fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }

    res.json({
      success: true,
      downloadUrl: `/api/download/${outputFilename}`,
      filename: `${safeName}_${documentType.toUpperCase()}_v${version}.docx`,
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    // Clean up uploaded file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
    next(err);
  }
});

// GET /api/download/:filename
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;

  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ success: false, error: 'Invalid filename' });
  }

  const filePath = path.join(OUTPUT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filePath);
});

module.exports = router;
