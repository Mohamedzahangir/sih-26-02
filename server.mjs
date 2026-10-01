/**
 * Kiosk production server: serves the built app (dist/) plus the two
 * kiosk-side services (OCR API + local PeerJS broker) — no internet needed.
 *
 *   npm run build && npm run start     (defaults to http://localhost:5173)
 *   PORT=8080 node server.mjs
 */
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { createOcrMiddleware } from './server/ocrApi.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const PORT = Number(process.env.PORT || 5173);
const DIST = path.join(process.cwd(), 'dist');

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('[kiosk] dist/index.html not found — run `npm run build` first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.gz': 'application/gzip',
};

const ocr = createOcrMiddleware();

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST, safePath);
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html'); // SPA fallback
  }
  const type = MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(String(req.url ?? '/').split('?')[0]);
  if (pathname.startsWith('/api/')) {
    ocr(req, res, () => res.writeHead(404).end('Not found'));
    return;
  }
  serveStatic(req, res, pathname);
});

const portFree = (port) =>
  new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    probe.listen(port);
  });

if (await portFree(9000)) {
  try {
    const { PeerServer } = require('peer');
    PeerServer({ port: 9000, path: '/peerjs' }, () => {
      console.log('[kiosk] peer broker listening on :9000/peerjs');
    });
  } catch (error) {
    console.warn(`[kiosk] peer broker failed to start: ${error?.message ?? error}`);
  }
} else {
  console.warn('[kiosk] peer broker already running on :9000 — reusing it (npm run dev?)');
}

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[kiosk] port ${PORT} is already in use — stop the other server or run with PORT=<other>`);
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[kiosk] Ambedkar Heritage Hub on http://localhost:${PORT}`);
});
