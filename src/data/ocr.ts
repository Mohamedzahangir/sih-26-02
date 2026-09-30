import type { ArchiveRecord } from '../types';
import { getTranslation } from './translations';

/** Id of the document produced by the simulated OCR pipeline. */
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
  /** Source-language page text (content + standard sample note). */
  text: string;
}

export const ocrDocument: OcrDocument = {
  id: OCR_DOCUMENT_ID,
  title: 'Constitution of India — Opening Leaves (Sample Scan)',
  description:
    'Document digitised in this session from a scanner-bed sample image. The record was produced by the simulated OCR pipeline and carries placeholder transcription fields for demonstration.',
  year: '1950',
  type: 'Historical Documents',
  language: 'English (detected) / Hindi',
  source: 'Scanner bed sample — Prototype OCR desk',
  tags: ['constitution', 'ocr', 'scan', 'sample'],
  image: 'images/constitution-calligraphic.jpg',
  credit: 'Calligraphic Constitution page — public domain (Wikimedia Commons)',
  confidence: 96.4,
  detectedLanguage: 'English',
  text: getTranslation(OCR_DOCUMENT_ID, 'en') ?? '',
};

/** Session record added when the visitor presses ADD TO DIGITAL ARCHIVE. */
export function buildOcrRecord(): ArchiveRecord {
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
    text: ocrDocument.text,
    isSample: true,
    credit: ocrDocument.credit,
  };
}

export default ocrDocument;
