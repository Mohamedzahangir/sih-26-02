/**
 * Vite plugin: brings up the two kiosk-side services during `npm run dev`
 * (and `npm run preview`), so tests and the kiosk UI always have them:
 *
 *   - OCR API      -> mounted as middleware on the Vite HTTP server (/api/*)
 *   - PeerJS broker -> standalone HTTP+WS server on port 9000, path /peerjs
 *     (runs on the kiosk machine itself — venue internet is not required)
 */
import { createRequire } from 'node:module';
import { createOcrMiddleware } from './ocrApi.mjs';

const require = createRequire(import.meta.url);

const PEER_PORT = 9000;
const PEER_PATH = '/peerjs';

function mountServices(server) {
  const ocr = createOcrMiddleware();
  server.middlewares.use((req, res, next) => {
    if (String(req.url ?? '').startsWith('/api/')) {
      ocr(req, res, next);
    } else {
      next();
    }
  });

  let closeBroker = null;
  try {
    const { PeerServer } = require('peer');
    PeerServer({ port: PEER_PORT, path: PEER_PATH }, (httpServer) => {
      closeBroker = () => httpServer.close();
    });
    console.log(`[kiosk] peer broker listening on :${PEER_PORT}${PEER_PATH}`);
  } catch (error) {
    console.warn(`[kiosk] peer broker failed to start: ${error?.message ?? error}`);
  }

  server.httpServer?.once('close', () => closeBroker?.());
}

export default function kioskServices() {
  return {
    name: 'ahh-kiosk-services',
    configureServer: mountServices,
    configurePreviewServer: mountServices,
  };
}
