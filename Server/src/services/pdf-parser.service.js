// File: src/services/pdf-parser.service.js

import { readFile } from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import { AppError } from '../utils/AppError.js';

/**
 * Extract text and page count from a PDF.
 *
 * @param {string} filePath
 * @returns {Promise<{ text: string, pageCount: number }>}
 */
export async function extractTextFromPdf(filePath) {
  let parser;

  try {
    const buffer = await readFile(filePath);
    parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    // Reject PDFs without extractable text
    if (!result.text || result.text.trim().length === 0) {
      throw new AppError(
        'No extractable text found in this PDF. Scanned/image-only PDFs are not supported.',
        400
      );
    }

    return {
      text: result.text,
      pageCount: result.total,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;

    throw new AppError(`Failed to parse PDF: ${err.message}`, 400);
  } finally {
    // Clean up parser resources
    if (parser) {
      await parser.destroy();
    }
  }
}