import { asset } from './asset';

export type OcrEvent =
  | { type: 'progress'; status: string; progress: number }
  | { type: 'done'; text: string; confidence: number; ms: number }
  | { type: 'error'; message: string };

/**
 * Streams one OCR job from the kiosk-local Tesseract service
 * (`POST /api/ocr`, NDJSON response) and forwards every event.
 */
export async function streamOcr(
  image: Blob,
  onEvent: (event: OcrEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(asset('api/ocr'), {
    method: 'POST',
    body: image,
    headers: { 'Content-Type': 'application/octet-stream' },
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`OCR service responded ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        onEvent(JSON.parse(trimmed) as OcrEvent);
      } catch {
        /* ignore a torn line */
      }
    }
  }
}

const STATUS_FLOOR: Record<string, number> = {
  'loading tesseract core': 0.06,
  'initializing tesseract': 0.14,
  'loading language traineddata': 0.2,
  'initializing api': 0.28,
};

/**
 * Maps a Tesseract status/progress pair onto a monotonic 0–1 pipeline value.
 * The caller keeps the running maximum so unknown statuses never move it back.
 */
export function overallProgress(status: string, progress: number): number {
  if (status === 'recognizing text') {
    return 0.3 + 0.65 * Math.min(1, Math.max(0, progress));
  }
  return STATUS_FLOOR[status] ?? 0;
}
