/**
 * Simple phone → kiosk transfer.
 * The kiosk QR opens the hash-based mobile upload page. The phone uploads the
 * image to /api/transfer and the kiosk polls for the next image.
 */
export interface ReceivedPhoto { name: string; blob: Blob; url: string; }

export function sendUrl(origin = window.location.origin): string {
  return `${origin}/#/mobile-send`;
}

export async function resolveSendUrl(): Promise<string> {
  const currentOrigin = window.location.origin;
  try {
    const response = await fetch('/api/kiosk-url', { cache: 'no-store' });
    if (response.ok) {
      const payload = (await response.json()) as { origin?: string };
      if (payload.origin) return sendUrl(payload.origin);
    }
  } catch { /* public deployments fall back to their own origin */ }
  return sendUrl(currentOrigin);
}
