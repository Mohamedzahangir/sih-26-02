import { useCallback, useRef, useState } from 'react';
import { Check, Image as ImageIcon, RefreshCw, Send as SendIcon, Upload, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { downscaleImage } from '../lib/image';

type Phase = 'idle' | 'sending' | 'sent' | 'error';

export default function MobileSend() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [percent, setPercent] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const choose = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setPhase('idle');
    setPercent(0);
  }, []);

  const upload = useCallback(async () => {
    if (!file || phase === 'sending') return;
    setPhase('sending');
    setPercent(10);
    try {
      const payload = await downscaleImage(file);
      setPercent(35);
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': payload.type || 'image/jpeg',
          'X-File-Name': encodeURIComponent(file.name || 'document.jpg'),
        },
        body: payload,
      });
      if (!response.ok) throw new Error('upload failed');
      setPercent(100);
      setPhase('sent');
    } catch {
      setPhase('error');
    }
  }, [file, phase]);

  const reset = useCallback(() => {
    setFile(null);
    setPhase('idle');
    setPercent(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-ink px-5 py-8 text-parchment">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-[0.68rem] font-semibold tracking-[0.28em] text-gold uppercase">Ambedkar Heritage Hub</p>
          <h1 className="mt-3 font-display text-3xl">Send Document</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-cool">
            Take a clear photo of the document. It will be sent directly to the kiosk for digitization.
          </p>
        </div>

        <div className="border border-gold/25 bg-ink-2/70 p-5">
          <input
            ref={inputRef}
            id="mobile-document"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={choose}
          />
          <input
            id="mobile-gallery"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={choose}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label
              htmlFor="mobile-document"
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 border border-gold/35 px-4 text-center transition-colors hover:border-gold hover:bg-gold/5"
            >
              <ImageIcon size={25} className="text-gold" />
              <span className="text-sm font-semibold tracking-[0.12em] uppercase">
                Take Photo
              </span>
              <span className="text-xs text-cool">Open camera</span>
            </label>

            <label
              htmlFor="mobile-gallery"
              className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-3 border border-gold/35 px-4 text-center transition-colors hover:border-gold hover:bg-gold/5"
            >
              <ImageIcon size={25} className="text-gold" />
              <span className="text-sm font-semibold tracking-[0.12em] uppercase">
                Upload from Gallery
              </span>
              <span className="text-xs text-cool">Choose an image</span>
            </label>
          </div>

          {file && (
            <div className="mt-4 truncate border border-gold/15 px-4 py-3 text-xs text-cool">
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </div>
          )}

          {phase === 'sending' && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-cool">
                <span>Sending to kiosk</span><span>{percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden bg-ink">
                <motion.div className="h-full bg-gold" animate={{ width: `${percent}%` }} />
              </div>
            </div>
          )}

          {phase === 'sent' && (
            <div className="mt-5 flex items-center gap-2 border border-gold/25 px-4 py-3 text-sm text-gold">
              <Check size={17} /> Document sent to kiosk.
            </div>
          )}

          {phase === 'error' && (
            <div className="mt-5 flex items-center gap-2 border border-oxblood/30 px-4 py-3 text-sm text-oxblood">
              <WifiOff size={17} /> Could not reach the kiosk. Stay on the same network and try again.
            </div>
          )}

          <div className="mt-5">
            {phase === 'sent' ? (
              <button type="button" onClick={reset} className="flex min-h-12 w-full items-center justify-center gap-2 border border-gold/40 text-xs font-semibold tracking-[0.18em] uppercase">
                <RefreshCw size={15} /> Send Another
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void upload()}
                disabled={!file || phase === 'sending'}
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-gold px-5 text-xs font-semibold tracking-[0.18em] text-ink uppercase disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendIcon size={15} /> {phase === 'sending' ? 'Sending…' : 'Send to Kiosk'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-cool">
          <Upload size={14} className="text-gold" />
          <span>1. Take photo · 2. Send · 3. Kiosk starts OCR</span>
        </div>
      </div>
    </div>
  );
}
