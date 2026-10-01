/**
 * Phone → kiosk photo transfer protocol (PeerJS / WebRTC over the local
 * network — the broker runs on the kiosk machine itself, so no internet is
 * involved at any point).
 *
 * Wire format on the data channel:
 *   1. JSON string   { type:'meta', name, mime, size }
 *   2. ArrayBuffers  (image bytes, CHUNK_SIZE slices)
 *   3. JSON string   { type:'done' }   — or { type:'abort' } on failure
 */

export const CHUNK_SIZE = 16 * 1024;
export const PEER_PORT = 9000;
export const PEER_PATH = '/peerjs';

/** Stable per-session kiosk id (module scope: survives route changes and
 *  StrictMode remounts — the provider recreates the Peer with this id). */
export const KIOSK_PEER_ID = `ahh-kiosk-${Math.random().toString(36).slice(2, 10)}${Date.now()
  .toString(36)
  .slice(-4)}`;

/** Fallback URL used until the kiosk service resolves a LAN-reachable origin. */
export function sendUrl(origin = window.location.origin): string {
  return `${origin}/send?p=${KIOSK_PEER_ID}`;
}

/**
 * Resolve an origin that the visitor's phone can actually reach.
 * When the kiosk UI itself was opened on localhost, the server substitutes
 * the kiosk machine's first non-loopback IPv4 address for the QR payload.
 */
export async function resolveSendUrl(): Promise<string> {
  const currentOrigin = window.location.origin;
  const host = window.location.hostname;
  const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!loopback) return sendUrl(currentOrigin);

  try {
    const response = await fetch('/api/kiosk-url', { cache: 'no-store' });
    if (response.ok) {
      const payload = (await response.json()) as { origin?: string };
      if (payload.origin) return sendUrl(payload.origin);
    }
  } catch {
    /* keep the local fallback for environments without the kiosk service */
  }
  return sendUrl(currentOrigin);
}

export function kioskPeerOptions() {
  return {
    host: window.location.hostname,
    port: PEER_PORT,
    path: PEER_PATH,
    secure: window.location.protocol === 'https:',
    debug: 0,
  };
}

export type TransferMessage =
  | { type: 'meta'; name: string; mime: string; size: number }
  | { type: 'done' }
  | { type: 'abort'; message?: string };

export interface ReceivedPhoto {
  name: string;
  blob: Blob;
  /** Object URL for display (revoked when replaced). */
  url: string;
}
