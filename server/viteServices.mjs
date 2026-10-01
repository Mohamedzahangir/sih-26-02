/**
 * Vite plugin: mounts the kiosk-side API during development and preview.
 * The same HTTP server handles the QR upload portal and offline OCR.
 */
import { createOcrMiddleware } from './ocrApi.mjs';

function mountServices(server) {
  const ocr = createOcrMiddleware();
  server.middlewares.use((req, res, next) => {
    if (String(req.url ?? '').startsWith('/api/')) ocr(req, res, next);
    else next();
  });
}

export default function kioskServices() {
  return {
    name: 'ahh-kiosk-services',
    configureServer: mountServices,
    configurePreviewServer: mountServices,
  };
}
