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

/** The URL encoded in every QR code the kiosk displays. */
export function sendUrl(): string {
  return `${window.location.origin}/send?p=${KIOSK_PEER_ID}`;
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
