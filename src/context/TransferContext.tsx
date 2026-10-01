import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { resolveSendUrl, type ReceivedPhoto } from '../lib/transfer';

type TransferStatus = 'starting' | 'online' | 'offline';
interface TransferValue {
  status: TransferStatus;
  qrUrl: string;
  takePending(): ReceivedPhoto | null;
  subscribePhoto(listener: (photo: ReceivedPhoto) => boolean): () => void;
}
const TransferContext = createContext<TransferValue | null>(null);
const POLL_MS = 800;

export function TransferProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TransferStatus>('starting');
  const [qrUrl, setQrUrl] = useState('');
  const pendingRef = useRef<ReceivedPhoto | null>(null);
  const listenersRef = useRef(new Set<(photo: ReceivedPhoto) => boolean>());

  const takePending = useCallback(() => {
    const photo = pendingRef.current;
    pendingRef.current = null;
    return photo;
  }, []);

  const subscribePhoto = useCallback((listener: (photo: ReceivedPhoto) => boolean) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const deliver = useCallback((photo: ReceivedPhoto) => {
    let consumed = false;
    listenersRef.current.forEach((listener) => { if (listener(photo)) consumed = true; });
    if (!consumed) {
      const previous = pendingRef.current;
      pendingRef.current = photo;
      if (previous) URL.revokeObjectURL(previous.url);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let timer: number | null = null;
    const poll = async () => {
      if (disposed) return;
      try {
        const response = await fetch('/api/transfer/next', { cache: 'no-store' });
        if (!response.ok) {
          setStatus('offline');
        } else {
          setStatus('online');
          if (response.status !== 204) {
            const blob = await response.blob();
            const rawName = response.headers.get('X-File-Name') || 'document.jpg';
            let name = rawName;
            try { name = decodeURIComponent(rawName); } catch { /* keep raw */ }
            deliver({ name, blob, url: URL.createObjectURL(blob) });
          }
        }
      } catch {
        if (!disposed) setStatus('offline');
      } finally {
        if (!disposed) timer = window.setTimeout(poll, POLL_MS);
      }
    };
    void poll();
    return () => {
      disposed = true;
      if (timer !== null) window.clearTimeout(timer);
      const pending = pendingRef.current;
      if (pending) URL.revokeObjectURL(pending.url);
      pendingRef.current = null;
    };
  }, [deliver]);

  useEffect(() => {
    let active = true;
    void resolveSendUrl().then((resolved) => { if (active) setQrUrl(resolved); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ status, qrUrl, takePending, subscribePhoto }), [status, qrUrl, takePending, subscribePhoto]);
  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

export function useTransfer(): TransferValue {
  const context = useContext(TransferContext);
  if (!context) throw new Error('useTransfer must be used inside TransferProvider');
  return context;
}
