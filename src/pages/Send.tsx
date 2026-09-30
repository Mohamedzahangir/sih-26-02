import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Image as ImageIcon, RefreshCw, Send as SendIcon, Wifi, WifiOff } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { useT } from '../i18n';
import { CHUNK_SIZE, kioskPeerOptions, type TransferMessage } from '../lib/transfer';
import { downscaleImage } from '../lib/image';
import { Peer, type DataConnection } from 'peerjs';

type ConnStatus = 'connecting' | 'ready' | 'error' | 'closed' | 'no-id';
type SendPhase = 'idle' | 'sending' | 'sent' | 'error';

const DIAL_RETRY_MS = 1600;
const DIAL_MAX_ATTEMPTS = 12;

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function Send() {
  const t = useT();
  const [params] = useSearchParams();
  const kioskId = (params.get('p') ?? '').trim();

  const [connStatus, setConnStatus] = useState<ConnStatus>(kioskId ? 'connecting' : 'no-id');
  const [phase, setPhase] = useState<SendPhase>('idle');
  const [percent, setPercent] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const connRef = useRef<DataConnection | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ------------------------- connect to the kiosk ------------------------- */
  useEffect(() => {
    if (!kioskId) return;
    let disposed = false;
    let peer: Peer | null = null;
    let dialAttempt = 0;
    let dialTimer: number | null = null;

    const dial = () => {
      if (disposed || !peer) return;
      const conn = peer.connect(kioskId, { reliable: true });
      connRef.current = conn;
      conn.on('open', () => {
        if (disposed) return;
        dialAttempt = 0;
        setConnStatus('ready');
      });
      conn.on('close', () => {
        if (disposed) return;
        if (connRef.current === conn) connRef.current = null;
        setConnStatus((current) => (current === 'ready' ? 'closed' : 'error'));
      });
      conn.on('error', () => {
        if (disposed) return;
        setConnStatus('error');
      });
    };

    const scheduleDial = () => {
      dialAttempt += 1;
      if (dialAttempt > DIAL_MAX_ATTEMPTS) {
        setConnStatus('error');
        return;
      }
      if (dialTimer !== null) window.clearTimeout(dialTimer);
      dialTimer = window.setTimeout(dial, DIAL_RETRY_MS);
    };

    peer = new Peer(`ahh-phone-${Math.random().toString(36).slice(2, 10)}`, kioskPeerOptions());
    peer.on('open', dial);
    peer.on('error', (error: { type?: string }) => {
      if (disposed) return;
      if (error.type === 'peer-unavailable') {
        // kiosk digitizer not listening yet — keep redialing for a while
        scheduleDial();
        return;
      }
      setConnStatus('error');
    });

    return () => {
      disposed = true;
      if (dialTimer !== null) window.clearTimeout(dialTimer);
      try {
        connRef.current?.close();
      } catch {
        /* already closed */
      }
      connRef.current = null;
      peer?.destroy();
    };
  }, [kioskId, retryToken]);

  const pickFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setPhase('idle');
    setPercent(0);
  }, []);

  /* ------------------------------- send flow ------------------------------ */
  const send = useCallback(async () => {
    const conn = connRef.current;
    if (!conn || !conn.open || !file || phase === 'sending') return;
    setPhase('sending');
    setPercent(0);
    try {
      const payload = await downscaleImage(file);
      const meta: TransferMessage = {
        type: 'meta',
        name: file.name,
        mime: payload.type || 'image/jpeg',
        size: payload.size,
      };
      conn.send(JSON.stringify(meta));

      const bytes = new Uint8Array(await payload.arrayBuffer());
      for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
        const slice = bytes.slice(offset, offset + CHUNK_SIZE);
        conn.send(slice.buffer as ArrayBuffer);
        setPercent(Math.min(99, Math.round(((offset + CHUNK_SIZE) / bytes.length) * 100)));
        // respect data-channel backpressure
        let guard = 0;
        const buffered = () =>
          (conn as unknown as { bufferedAmount?: number }).bufferedAmount ?? 0;
        while (buffered() > 4 * 1024 * 1024 && guard < 200) {
          await sleep(50);
          guard += 1;
        }
      }
      conn.send(JSON.stringify({ type: 'done' } satisfies TransferMessage));
      setPercent(100);
      setPhase('sent');
    } catch {
      setPhase('error');
      try {
        conn.send(JSON.stringify({ type: 'abort' } satisfies TransferMessage));
      } catch {
        /* channel already gone */
      }
    }
  }, [file, phase]);

  const sendAnother = useCallback(() => {
    setFile(null);
    setPhase('idle');
    setPercent(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const statusText =
    phase === 'sent'
      ? t('send.status.sent')
      : phase === 'sending'
        ? t('send.sending', { percent })
        : connStatus === 'no-id'
          ? t('send.needQr')
          : connStatus === 'connecting'
            ? t('send.status.connecting')
            : connStatus === 'ready'
              ? t('send.status.ready')
              : connStatus === 'closed'
                ? t('send.status.closed')
                : t('send.status.error');

  const statusTone =
    phase === 'sent' || (phase !== 'sending' && connStatus === 'ready')
      ? 'text-gold'
      : connStatus === 'error' || connStatus === 'closed' || phase === 'error'
        ? 'text-oxblood'
        : 'text-cool';

  const canSend = connStatus === 'ready' && Boolean(file) && phase !== 'sending';

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-3xl px-5 pt-14 pb-12 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              as="h1"
              eyebrow={t('send.kicker')}
              title={t('send.title')}
              description={t('send.desc')}
              align="center"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-5 py-12 sm:px-8">
        {/* -------------------------------- STATUS -------------------------------- */}
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-[64px] items-center justify-center gap-3 border border-gold/25 bg-ink-2/70 px-5 py-4 text-center"
        >
          {connStatus === 'ready' && phase !== 'sent' && phase !== 'sending' && (
            <Wifi size={17} strokeWidth={1.8} className="shrink-0 text-gold" />
          )}
          {(connStatus === 'error' || connStatus === 'closed') && phase !== 'sent' && (
            <WifiOff size={17} strokeWidth={1.8} className="shrink-0 text-oxblood" />
          )}
          {phase === 'sent' && <Check size={17} strokeWidth={2.4} className="shrink-0 text-gold" />}
          <p className={`text-[0.8rem] font-semibold tracking-[0.16em] uppercase ${statusTone}`}>
            {statusText}
          </p>
        </div>

        {(connStatus === 'error' || connStatus === 'closed') && (
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setRetryToken((token) => token + 1)}
            >
              <RefreshCw size={15} strokeWidth={1.8} />
              {t('send.retry')}
            </Button>
          </div>
        )}

        {/* ------------------------------- PHOTO PICKER ------------------------------ */}
        <div className="mt-7 border border-gold/25 bg-ink-2/50 px-6 py-8">
          <input
            ref={inputRef}
            id="send-photo"
            type="file"
            accept="image/*"
            className="peer sr-only"
            onChange={pickFile}
          />
          <label
            htmlFor="send-photo"
            className="inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-3 border border-gold/45 px-8 text-[0.74rem] font-semibold tracking-[0.24em] text-parchment uppercase transition-colors duration-200 hover:border-gold hover:bg-gold/10 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
          >
            <ImageIcon size={16} strokeWidth={1.8} />
            {t('send.pick')}
          </label>

          {file && (
            <p className="mt-4 truncate text-[0.85rem] text-cool" title={file.name}>
              {file.name}
              <span className="text-muted"> · {(file.size / 1024).toFixed(0)} KB</span>
            </p>
          )}

          {phase === 'sending' && (
            <div className="mt-6">
              <div className="h-2 w-full overflow-hidden border border-gold/20 bg-ink">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {phase === 'error' && (
            <p className="mt-4 border-l-2 border-oxblood/70 pl-3 text-[0.84rem] leading-relaxed text-oxblood">
              {t('send.error.decode')}
            </p>
          )}

          <div className="mt-6">
            {phase === 'sent' ? (
              <Button variant="outline" className="w-full" onClick={sendAnother}>
                <RefreshCw size={15} strokeWidth={1.8} />
                {t('send.again')}
              </Button>
            ) : (
              <Button className="w-full" onClick={() => void send()} disabled={!canSend}>
                <SendIcon size={15} strokeWidth={1.9} />
                {phase === 'sending' ? t('send.sending', { percent }) : t('send.send')}
              </Button>
            )}
          </div>
        </div>

        <ol className="mt-8 space-y-3">
          {(['send.step.1', 'send.step.2', 'send.step.3'] as const).map((key, index) => (
            <li key={key} className="flex items-center gap-3 text-[0.88rem] text-cool">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center border border-gold/40 text-[0.66rem] font-semibold text-gold"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              {t(key)}
            </li>
          ))}
        </ol>
      </section>

      <Footer />
    </div>
  );
}
