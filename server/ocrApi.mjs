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

function firstLanIPv4() {
  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === 'IPv4' && !entry.internal) return entry.address;
    }
  }
  return null;
}

let workerPromise = null;

// One waiting upload is enough for this single-kiosk workflow.
const transferQueue = [];
const MAX_TRANSFER_QUEUE = 5;
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

    if (pathname === '/api/kiosk-url' && req.method === 'GET') {
      const host = String(req.headers.host ?? '').split(':')[0];
      const isLoopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
      const lanHost = isLoopback ? firstLanIPv4() : null;
      const port = String(req.headers.host ?? '').includes(':')
        ? String(req.headers.host).split(':').pop()
        : '';
      const selectedHost = lanHost ?? host;
      const protocol = String(req.headers['x-forwarded-proto'] || 'http').split(',')[0].trim();
      const origin = selectedHost ? `${protocol}://${selectedHost}${port ? `:${port}` : ''}` : '';
      writeJson(res, 200, { ok: Boolean(origin), origin });
      return;
    }

    if (pathname === '/api/transfer' && req.method === 'POST') {
      readBody(req)
        .then((buffer) => {
          if (!buffer.length) {
            writeJson(res, 400, { ok: false, error: 'empty image' });
            return;
          }
          if (transferQueue.length >= MAX_TRANSFER_QUEUE) {
            writeJson(res, 429, { ok: false, error: 'kiosk transfer queue is full' });
            return;
          }
          transferQueue.push({
            buffer,
            contentType: String(req.headers['content-type'] || 'image/jpeg').split(';')[0],
            fileName: String(req.headers['x-file-name'] || 'document.jpg'),
          });
          writeJson(res, 200, { ok: true, queued: transferQueue.length });
        })
        .catch((error) => {
          if (!res.headersSent) writeJson(res, 413, { ok: false, error: String(error?.message ?? error) });
        });
      return;
    }

    if (pathname === '/api/transfer/next' && req.method === 'GET') {
      if (!transferQueue.length) {
        res.writeHead(204, { 'Cache-Control': 'no-store' });
        res.end();
        return;
      }
      const transfer = transferQueue.shift();
      res.writeHead(200, {
        'Content-Type': transfer.contentType,
        'Content-Length': transfer.buffer.length,
        'X-File-Name': transfer.fileName,
        'Cache-Control': 'no-store',
      });
      res.end(transfer.buffer);
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
