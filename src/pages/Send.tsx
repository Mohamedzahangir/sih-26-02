import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Image as ImageIcon, RefreshCw, Send as SendIcon, Upload, WifiOff } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { useT } from '../i18n';
import { downscaleImage } from '../lib/image';

type SendPhase = 'idle' | 'sending' | 'sent' | 'error';

export default function Send() {
  const t = useT();
  const [phase, setPhase] = useState<SendPhase>('idle');
  const [percent, setPercent] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setPhase('idle');
    setPercent(0);
  }, []);

  const send = useCallback(async () => {
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
      setPercent(85);
      if (!response.ok) throw new Error('upload failed');
      setPercent(100);
      setPhase('sent');
    } catch {
      setPhase('error');
    }
  }, [file, phase]);

  const sendAnother = useCallback(() => {
    setFile(null);
    setPhase('idle');
    setPercent(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const statusText = phase === 'sent'
    ? t('send.status.sent')
    : phase === 'sending'
      ? t('send.sending', { percent })
      : phase === 'error'
        ? t('send.status.error')
        : t('send.status.ready');

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-3xl px-5 pt-14 pb-12 text-center sm:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <SectionHeader as="h1" eyebrow={t('send.kicker')} title={t('send.title')} description={t('send.desc')} align="center" />
          </motion.div>
        </div>
      </section>
      <section className="mx-auto max-w-xl px-5 py-12 sm:px-8">
        <div role="status" aria-live="polite" className="flex min-h-[64px] items-center justify-center gap-3 border border-gold/25 bg-ink-2/70 px-5 py-4 text-center">
          {phase === 'sent' ? <Check size={17} className="text-gold" /> : phase === 'error' ? <WifiOff size={17} className="text-oxblood" /> : <Upload size={17} className="text-gold" />}
          <p className="text-[0.8rem] font-semibold tracking-[0.16em] uppercase text-gold">{statusText}</p>
        </div>
        <div className="mt-7 border border-gold/25 bg-ink-2/50 px-6 py-8">
          <input ref={inputRef} id="send-photo" type="file" accept="image/*" capture="environment" className="peer sr-only" onChange={pickFile} />
          <label htmlFor="send-photo" className="inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-3 border border-gold/45 px-8 text-[0.74rem] font-semibold tracking-[0.24em] text-parchment uppercase transition-colors hover:border-gold hover:bg-gold/10 peer-focus-visible:outline-2 peer-focus-visible:outline-gold">
            <ImageIcon size={17} /> {t('send.pick')}
          </label>
          {file && <p className="mt-4 truncate text-center text-[0.85rem] text-cool" title={file.name}>{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          {phase === 'sending' && <div className="mt-6 h-2 w-full overflow-hidden border border-gold/20 bg-ink"><motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: `${percent}%` }} /></div>}
          {phase === 'error' && <p className="mt-4 border-l-2 border-oxblood/70 pl-3 text-[0.84rem] text-oxblood">{t('send.error.decode')}</p>}
          <div className="mt-6">
            {phase === 'sent'
              ? <Button variant="outline" className="w-full" onClick={sendAnother}><RefreshCw size={15} /> {t('send.again')}</Button>
              : <Button className="w-full" onClick={() => void send()} disabled={!file || phase === 'sending'}><SendIcon size={15} /> {phase === 'sending' ? t('send.sending', { percent }) : t('send.send')}</Button>}
          </div>
        </div>
        <ol className="mt-8 space-y-3">
          {(['send.step.1', 'send.step.2', 'send.step.3'] as const).map((key, index) => (
            <li key={key} className="flex items-center gap-3 text-[0.88rem] text-cool">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-gold/40 text-[0.66rem] font-semibold text-gold">{index + 1}</span>
              {t(key)}
            </li>
          ))}
        </ol>
      </section>
      <Footer />
    </div>
  );
}
