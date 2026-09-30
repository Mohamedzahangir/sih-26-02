import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface ScanQrProps {
  /** Payload — the kiosk's /send session URL. */
  value: string;
  size?: number;
  /** Accessible name announced for the graphic. */
  label?: string;
  className?: string;
}

/**
 * Real, scannable QR code rendered to a canvas (the decorative QrGlyph is
 * explicitly not an encoded code — this one is).
 */
export default function ScanQr({ value, size = 200, label, className = '' }: ScanQrProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#18110B', light: '#F6EFE3' },
    }).catch(() => {
      /* a valid URL is always passed here; ignore draw races on unmount */
    });
  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      data-qr="send"
      data-qr-value={value}
      width={size}
      height={size}
      className={className}
    />
  );
}
