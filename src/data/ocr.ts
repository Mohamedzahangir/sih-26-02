import type { ArchiveRecord } from '../types';
import { getTranslationContent } from './translations';

/** Id of the record produced when a digitised page matches the bundled sample. */
export const OCR_DOCUMENT_ID = 'scan-001';

export interface OcrDocument {
  id: string;
  title: string;
  description: string;
  year: string;
  type: ArchiveRecord['type'];
  language: string;
  source: string;
  tags: string[];
  image: string;
  credit: string;
  confidence: number;
  detectedLanguage: string;
  /** Source-language page content (without the standard sample note). */
  text: string;
}

export const ocrDocument: OcrDocument = {
  id: OCR_DOCUMENT_ID,
  title: 'Constitution of India — Opening Leaves (Sample Scan)',
  description:
    'Document digitised in this kiosk session from a sample photo by the on-machine OCR pipeline. The record carries the extracted transcription text.',
  year: '1950',
  type: 'Historical Documents',
  language: 'English (detected) / Hindi',
  source: 'Visitor upload — kiosk OCR desk',
  tags: ['constitution', 'ocr', 'scan', 'sample'],
  image: 'images/constitution-calligraphic.jpg',
  credit: 'Calligraphic Constitution page — public domain (Wikimedia Commons)',
  confidence: 96.4,
  detectedLanguage: 'English',
  text: getTranslationContent(OCR_DOCUMENT_ID, 'en') ?? '',
};

export interface OcrRunInput {
  /** Raw text extracted by the OCR engine. */
  text: string;
  confidence: number;
  fileName: string;
  /** True when the extraction matches the bundled sample translations. */
  matched: boolean;
  /** Object URL (or asset path) of the photo that was digitised. */
  image: string;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

/** Word-level overlap between an extraction and the bundled sample text. */
export function matchesSampleText(text: string): boolean {
  const expected = tokenize(ocrDocument.text);
  if (expected.length === 0) return false;
  const actual = new Set(tokenize(text));
  const hits = expected.filter((token) => actual.has(token)).length;
  return hits / expected.length >= 0.8;
}

/** Session record added when the visitor presses ADD TO DIGITAL ARCHIVE. */
export function buildOcrRecord(run: OcrRunInput): ArchiveRecord {
  if (run.matched) {
    return {
      id: ocrDocument.id,
      title: ocrDocument.title,
      year: ocrDocument.year,
      type: ocrDocument.type,
      description: ocrDocument.description,
      language: ocrDocument.language,
      source: ocrDocument.source,
      tags: ocrDocument.tags,
      image: ocrDocument.image,
      text: run.text,
      isSample: true,
      credit: ocrDocument.credit,
    };
  }
  const title = run.fileName.replace(/\.[^.]+$/, '').trim() || 'Scanned document';
  return {
    id: `scan-${Date.now().toString(36)}`,
    title,
    year: 'Undated',
    type: 'Historical Documents',
    description:
      'Photo digitised in this kiosk session by the on-machine OCR pipeline (Tesseract, English).',
    language: 'English (detected)',
    source: 'Visitor upload — kiosk session',
    tags: ['scan', 'ocr', 'session'],
    image: run.image,
    text: run.text,
    isSample: false,
  };
}

export default ocrDocument;
