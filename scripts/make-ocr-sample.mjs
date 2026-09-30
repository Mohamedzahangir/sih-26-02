/**
 * Generates public/images/ocr-sample.png — a crisp, high-contrast render of
 * the scan-001 sample text (src/data/translations.ts, English). This is the
 * bundled demo photo: the offline OCR pipeline reads it end-to-end, so the
 * extracted text matches the stored translations without any network access.
 *
 * Usage: node ./scripts/make-ocr-sample.mjs
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';

const EXE = process.env.CHROME_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = fileURLToPath(new URL('../public/images/ocr-sample.png', import.meta.url));

const SAMPLE_TEXT = `CONSTITUTION OF INDIA — OPENING LEAVES
[Page 1 of 1 · simulated recognition · reading order preserved]

PIPELINE SUMMARY
Page detected: single sheet, portrait orientation; ornamental border suppressed as non-text.
Deskew applied: 0.8° rotation corrected. Script mix: Latin (primary) with Devanagari
in the upper margin band. Line segmentation: 14 body lines, 1 display line,
2 marginal notes.

RECOGNISED SAMPLE LINES
1. WE, THE PEOPLE OF INDIA — display line, confidence 99.1%
2. The opening clause is retained in reading order; the remainder of the page is
   represented by sample placeholders in this prototype.
3. Marginal notes flagged for manual review — 2 glyphs below the confidence threshold.

Confidence: block average 96.4% · language detected: English.`;

const html = `<!doctype html>
<html>
<head><meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: #fff; }
  pre {
    margin: 0;
    padding: 72px 84px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 30px;
    line-height: 1.62;
    color: #111;
    white-space: pre-wrap;
    width: 1440px;
    box-sizing: border-box;
  }
</style>
</head>
<body><pre>${SAMPLE_TEXT.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre></body>
</html>`;

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log(`wrote ${OUT}`);
