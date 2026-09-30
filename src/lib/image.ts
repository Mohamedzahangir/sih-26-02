/** Client-side photo downscale: keeps phones from sending 10 MB camera files
 *  over the data channel — max edge 1600 px, JPEG ~0.82 quality. */
export const MAX_EDGE = 1600;
export const JPEG_QUALITY = 0.82;

export async function downscaleImage(
  file: Blob,
  maxEdge = MAX_EDGE,
  quality = JPEG_QUALITY,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas unavailable');
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob) throw new Error('image encoding failed');
    return blob;
  } finally {
    bitmap.close();
  }
}
