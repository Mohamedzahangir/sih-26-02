/**
 * Kiosk-side OCR service (Tesseract, English only, fully offline).
 *
 * Exposed as a connect-style middleware so both the Vite dev server and the
 * production kiosk server (server.mjs) can mount it:
 *
 *   GET  /api/health          -> { ok, engine, languages }
 *   POST /api/ocr             -> NDJSON stream:
 *                                  {"type":"progress","status":...,"progress":0-1}
 *                                  {"type":"done","text":...,"confidence":...,"ms":...}
 *                                  {"type":"error","message":...}
 *
 * Jobs are processed one at a time (single visitor at the kiosk); each POST
 * body carries the raw image bytes.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createWorker, OEM } = require('tesseract.js');

/* process.cwd() is the project root for both `vite` and `node server.mjs`,
   which keeps the bundled-vite-config import.meta.url rewrites out of it. */
const TESSDATA_DIR = path.join(process.cwd(), 'server', 'tessdata');
const CACHE_DIR = path.join(os.tmpdir(), 'ahh-tessdata');

const MAX_BODY_BYTES = 30 * 1024 * 1024;
const JOB_TIMEOUT_MS = 45000;

let workerPromise = null;
/** Logger forwarder for the job currently running (worker logger is global). */
let activeForward = null;
let queued = [];
let running = false;

function ensureWorker() {
  if (!workerPromise) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    workerPromise = createWorker('eng', OEM.LSTM_ONLY, {
      langPath: TESSDATA_DIR,
      gzip: true,
      cachePath: CACHE_DIR,
      logger: (event) => activeForward?.(event),
      errorHandler: (error) => console.error('[ocr] worker error:', error),
    });
    workerPromise.catch(() => {
      workerPromise = null; // allow a retry to spawn a fresh worker
    });
  }
  return workerPromise;
}

function writeJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('image too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function runJob({ buffer, res }) {
  let finished = false;
  let timer = null;
  const send = (obj) => {
    if (finished) return;
    try {
      res.write(`${JSON.stringify(obj)}\n`);
    } catch {
      /* client went away mid-stream */
    }
  };
  /** Terminate the stream with a final event (done/error) exactly once. */
  const finish = (obj) => {
    if (finished) return;
    finished = true;
    activeForward = null;
    if (timer) clearTimeout(timer);
    try {
      res.write(`${JSON.stringify(obj)}\n`);
    } catch {
      /* client went away */
    }
    res.end();
  };
  const forward = (event) =>
    send({ type: 'progress', status: event.status ?? '', progress: Number(event.progress ?? 0) });

  activeForward = forward;
  timer = setTimeout(() => finish({ type: 'error', message: 'OCR timed out' }), JOB_TIMEOUT_MS);

  try {
    const worker = await ensureWorker();
    const started = Date.now();
    const { data } = await worker.recognize(buffer);
    finish({
      type: 'done',
      text: String(data?.text ?? '').trim(),
      confidence: Math.round(Number(data?.confidence ?? 0)),
      ms: Date.now() - started,
    });
  } catch (error) {
    finish({ type: 'error', message: String(error?.message ?? error) });
  }
}

function pump() {
  if (running) return;
  const job = queued.shift();
  if (!job) return;
  running = true;
  runJob(job).finally(() => {
    running = false;
    pump();
  });
}

/** Connect-style middleware handling /api/health and /api/ocr. */
export function createOcrMiddleware() {
  return function ocrMiddleware(req, res, next) {
    const [pathname] = String(req.url ?? '').split('?');

    if (pathname === '/api/health' && req.method === 'GET') {
      writeJson(res, 200, { ok: true, engine: 'tesseract', languages: ['eng'] });
      return;
    }

    if (pathname === '/api/ocr' && req.method === 'POST') {
      readBody(req)
        .then((buffer) => {
          if (!buffer.length) {
            writeJson(res, 400, { ok: false, error: 'empty body' });
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'application/x-ndjson; charset=utf-8',
            'Cache-Control': 'no-store',
            Connection: 'keep-alive',
          });
          queued.push({ buffer, res });
          pump();
        })
        .catch((error) => {
          if (!res.headersSent) {
            writeJson(res, 413, { ok: false, error: String(error?.message ?? error) });
          } else {
            res.end();
          }
        });
      return;
    }

    next();
  };
}
