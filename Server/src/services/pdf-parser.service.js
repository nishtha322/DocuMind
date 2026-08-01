// src/services/pdf-parser.service.js
//
// WHY pdf-parse OVER pdfjs-dist:
// pdfjs-dist (Mozilla's PDF.js) is the more "complete" library — it can
// render pages, extract embedded images, handle complex layouts — but
// that power comes with a much heavier API surface. We only need raw
// text + page count for RAG chunking, and pdf-parse gives us exactly
// that with a tiny API. If a future requirement needs page-accurate
// layout extraction or rendering, pdfjs-dist is the documented upgrade
// path — worth naming as a conscious scope decision, not an oversight.
//
// This file is the ONLY place that imports `pdf-parse` directly, so if
// we ever swap PDF libraries, this is the one file that changes.

import { readFile } from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';

/**
 * Extracts plain text and page count from a PDF file on disk.
 * @param {string} filePath - absolute path to the PDF file
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
export async function extractTextFromPdf(filePath) {
  let parser;
  try {
    const buffer = await readFile(filePath);
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    if (!result.text || result.text.trim().length === 0) {
      // This commonly happens with SCANNED (image-only) PDFs that have no
      // embedded text layer. Handling that would require OCR (e.g.
      // Tesseract) — explicitly out of scope for this project, so we fail
      // clearly instead of silently returning an empty document.
      throw new AppError(
        'No extractable text found in this PDF. Scanned/image-only PDFs are not supported.',
        400
      );
    }

    return { text: result.text, pageCount: result.total };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Failed to parse PDF: ${err.message}`, 400);
  } finally {
    // Always release the parser's internal resources, even on failure.
    if (parser) await parser.destroy();
  }
}
