// src/services/pdf-parser.service.js


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
