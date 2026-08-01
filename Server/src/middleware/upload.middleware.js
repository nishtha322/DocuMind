// src/middleware/upload.middleware.js
//
// WHY MULTER:
// Express does not parse `multipart/form-data` (the encoding used for
// file uploads) on its own — `express.json()` only handles JSON bodies.
// Multer is the standard, battle-tested middleware for this in the
// Express ecosystem.
//
// WHY DISK STORAGE (not memory storage, not direct-to-S3):
// - memoryStorage() holds the whole file in RAM as a Buffer — fine for
//   tiny files, dangerous for a Node process handling concurrent PDF
//   uploads (a few large PDFs uploaded at once could exhaust memory and
//   crash the process).
// - diskStorage() streams the file to disk instead, which is far more
//   memory-safe and is what most real backends do for user uploads
//   before optionally moving the file to object storage (S3/GCS).
// - Direct-to-S3 (presigned URLs) is the eventual production answer for
//   horizontally-scaled deployments (so any instance can serve any file),
//   but it's extra infrastructure this project doesn't need yet. Worth
//   naming as the "next step" in an interview.
//
// WHY VALIDATE MIME TYPE *AND* EXTENSION:
// A malicious or mistaken upload could have a spoofed MIME type header.
// Checking both the declared mimetype and the file extension is a cheap,
// meaningful extra layer of validation before we ever try to parse the
// file as a PDF.

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

// WHY THIS WRAPPER:
// Multer's own errors (e.g. file too large) surface as `multer.MulterError`,
// not our `AppError`, so our global error handler would treat them as
// unexpected 500-level bugs and hide the real message from the client.
// This thin wrapper normalizes multer errors into AppError so the client
// gets a clean, correct 400 with a useful message either way.
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
