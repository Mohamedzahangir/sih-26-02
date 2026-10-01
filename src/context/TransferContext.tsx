import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Peer, type DataConnection } from 'peerjs';
import {
  KIOSK_PEER_ID,
  kioskPeerOptions,
  type ReceivedPhoto,
  type TransferMessage,
  resolveSendUrl,
} from '../lib/transfer';

type TransferStatus = 'starting' | 'online' | 'offline';

interface TransferValue {
  /** Broker/session status of this kiosk's peer. */
  status: TransferStatus;
  /** QR payload — opens the phone upload page bound to this session. */
  qrUrl: string;
  /** Take a photo that arrived while nothing was listening (null if none). */
  takePending(): ReceivedPhoto | null;
  /** Listen for incoming photos; return true when consumed. */
  subscribePhoto(listener: (photo: ReceivedPhoto) => boolean): () => void;
}

const TransferContext = createContext<TransferValue | null>(null);

/**
 * App-level phone → kiosk transfer endpoint.
 *
 * One PeerJS host per browser session (created once, survives route changes),
 * so every QR the kiosk shows — home band, scan frame, digitizer — points at
 * the same live session. Photos that arrive while the digitizer is not
 * listening wait in a pending slot and are picked up when it opens.
 */
export function TransferProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TransferStatus>('starting');
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const pendingRef = useRef<ReceivedPhoto | null>(null);
  const listenersRef = useRef(new Set<(photo: ReceivedPhoto) => boolean>());

  const takePending = useCallback(() => {
    const photo = pendingRef.current;
    pendingRef.current = null;
    return photo;
  }, []);

  const subscribePhoto = useCallback((listener: (photo: ReceivedPhoto) => boolean) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let retryTimer: number | null = null;
    let attempt = 0;

    const storePending = (photo: ReceivedPhoto) => {
      const previous = pendingRef.current;
      pendingRef.current = photo;
      if (previous) URL.revokeObjectURL(previous.url);
    };

    const deliver = (photo: ReceivedPhoto) => {
      let consumed = false;
      listenersRef.current.forEach((listener) => {
        if (listener(photo)) consumed = true;
      });
      if (!consumed) storePending(photo);
    };

    const acceptConnection = (conn: DataConnection) => {
      if (disposed) {
        conn.close();
        return;
      }
      const previous = connRef.current;
      if (previous && previous !== conn) previous.close();
      connRef.current = conn;

      const chunks: BlobPart[] = [];
      let meta: { name: string; mime: string } | null = null;
      const reset = () => {
        chunks.length = 0;
        meta = null;
      };

      conn.on('data', (raw: unknown) => {
        if (typeof raw === 'string') {
          let message: TransferMessage;
          try {
            message = JSON.parse(raw) as TransferMessage;
          } catch {
            return;
          }
          if (message.type === 'meta') {
            reset();
            meta = { name: message.name || 'photo.jpg', mime: message.mime || 'image/jpeg' };
          } else if (message.type === 'done' && meta) {
            const blob = new Blob(chunks, { type: meta.mime });
            const photo: ReceivedPhoto = { name: meta.name, blob, url: URL.createObjectURL(blob) };
            reset();
            deliver(photo);
          } else if (message.type === 'abort') {
            reset();
          }
          return;
        }
        if (raw instanceof ArrayBuffer) {
          chunks.push(raw);
        } else if (ArrayBuffer.isView(raw)) {
          const copy = new Uint8Array(raw.byteLength);
          copy.set(new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength));
          chunks.push(copy);
        }
      });

      const drop = () => {
        if (connRef.current === conn) connRef.current = null;
        reset();
      };
      conn.on('close', drop);
      conn.on('error', drop);
    };

    const scheduleRetry = () => {
      if (disposed || retryTimer !== null) return;
      attempt += 1;
      if (attempt > 8) {
        setStatus('offline');
        return;
      }
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        connectPeer();
      }, Math.min(1500 * attempt, 8000));
    };

    const connectPeer = () => {
      if (disposed) return;
      try {
        peerRef.current?.destroy();
      } catch {
        /* already dead */
      }
      const peer = new Peer(KIOSK_PEER_ID, kioskPeerOptions());
      peerRef.current = peer;

      peer.on('open', () => {
        if (disposed || peerRef.current !== peer) return;
        attempt = 0;
        if (retryTimer !== null) {
          window.clearTimeout(retryTimer);
          retryTimer = null;
        }
        setStatus('online');
      });
      peer.on('connection', acceptConnection);
      peer.on('disconnected', () => {
        // Never peer.reconnect() here: destroy() emits 'disconnected' before it
        // marks the peer destroyed, so a reconnect would open a zombie socket
        // that holds our id forever and every retry fails with unavailable-id.
        if (disposed || peerRef.current !== peer) return;
        scheduleRetry();
      });
      peer.on('error', (error: { type?: string }) => {
        if (disposed || peerRef.current !== peer) return;
        const type = error.type;
        if (type === 'unavailable-id') {
          // id briefly held by our own closing socket (StrictMode remount)
          scheduleRetry();
          return;
        }
        setStatus('offline');
        if (
          type === 'network' ||
          type === 'server-error' ||
          type === 'socket-error' ||
          type === 'socket-closed'
        ) {
          scheduleRetry();
        }
      });
    };

    connectPeer();

    return () => {
      disposed = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
      try {
        connRef.current?.close();
      } catch {
        /* already closed */
      }
      connRef.current = null;
      peerRef.current?.destroy();
      peerRef.current = null;
      setStatus('starting');
    };
  }, []);

  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    let active = true;
    void resolveSendUrl().then((resolved) => {
      if (active) setQrUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<TransferValue>(
    () => ({
      status,
      qrUrl,
      takePending,
      subscribePhoto,
    }),
    [status, qrUrl, takePending, subscribePhoto],
  );

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

export function useTransfer(): TransferValue {
  const context = useContext(TransferContext);
  if (!context) throw new Error('useTransfer must be used inside TransferProvider');
  return context;
}
