import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { archiveRecords } from '../data';
import type { ArchiveRecord } from '../types';

interface ArchiveValue {
  /** Every record visible this session (seeded collection + anything added). */
  records: ArchiveRecord[];
  /** Ids added during the current session (badge + search ordering). */
  sessionIds: string[];
  addRecord: (record: ArchiveRecord) => void;
}

const ArchiveContext = createContext<ArchiveValue | null>(null);

export function ArchiveProvider({ children }: { children: ReactNode }) {
  const [sessionRecords, setSessionRecords] = useState<ArchiveRecord[]>([]);

  const addRecord = useCallback((record: ArchiveRecord) => {
    setSessionRecords((current) =>
      current.some((item) => item.id === record.id) ? current : [...current, record],
    );
  }, []);

  const value = useMemo<ArchiveValue>(() => {
    const records = [...archiveRecords, ...sessionRecords];
    return {
      records,
      sessionIds: sessionRecords.map((record) => record.id),
      addRecord,
    };
  }, [sessionRecords, addRecord]);

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive(): ArchiveValue {
  const context = useContext(ArchiveContext);
  if (!context) throw new Error('useArchive must be used inside ArchiveProvider');
  return context;
}
