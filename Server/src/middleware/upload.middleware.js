// src/middleware/upload.middleware.js


import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError.js';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure the uploads directory exists before multer tries to write into it.
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Never trust the original filename alone as the stored filename —
    // collisions and path-traversal-style characters are a real risk.
    // We generate a unique name but keep the original for display purposes
    // (stored separately in the `documents` table as `original_filename`).
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}.pdf`);
  },
});

function fileFilter(req, file, cb) {
  const isPdfMimeType = file.mimetype === 'application/pdf';
  const isPdfExtension = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMimeType || !isPdfExtension) {
    return cb(new AppError('Only PDF files are allowed', 400));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB — generous for text-based PDFs, prevents abuse
  },
});

export function uploadPdf(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size is 20MB.', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    if (err) {
      return next(err); // already an AppError from fileFilter, or a real bug
    }
    if (!req.file) {
      return next(new AppError('No file uploaded. Expected field name "file".', 400));
    }
    next();
  });
}
