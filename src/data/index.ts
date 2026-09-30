import type { ArchiveRecord, Category } from '../types';
import { archiveRecords } from './archive';
import { timelineEvents } from './timeline';

export { archiveRecords, timelineEvents };

export const CATEGORIES: Category[] = [
  'Manuscripts',
  'Writings',
  'Speeches',
  'Photographs',
  'Historical Documents',
];

export const FEATURED_IDS = ['sp-002', 'ms-002', 'hd-001', 'ph-001'];

/**
 * Physical exhibit codes resolve to archive records, so a QR label printed for a
 * plaque can point at a stable, human-readable id (`doc-001`) while the record
 * keeps its catalogued id.
 */
const ID_ALIASES: Record<string, string> = {
  'doc-001': 'hd-003',
};

/** Id used by the demo QR flow. */
export const QR_TARGET_ID = 'doc-001';

export function getRecord(
  id: string | undefined,
  records: ArchiveRecord[] = archiveRecords,
): ArchiveRecord | undefined {
  if (!id) return undefined;
  const resolved = ID_ALIASES[id] ?? id;
  return records.find((record) => record.id === resolved);
}

/** The exhibit code a record is labelled with in the gallery (falls back to its id). */
export function exhibitCode(recordId: string): string {
  const entry = Object.entries(ID_ALIASES).find(([, target]) => target === recordId);
  return entry ? entry[0] : recordId;
}

export function getFeatured(records: ArchiveRecord[] = archiveRecords): ArchiveRecord[] {
  return FEATURED_IDS.map((id) => getRecord(id, records)).filter(
    (record): record is ArchiveRecord => Boolean(record),
  );
}

export function relatedRecords(
  id: string,
  limit = 3,
  records: ArchiveRecord[] = archiveRecords,
): ArchiveRecord[] {
  const current = getRecord(id, records);
  const sameType = records.filter((r) => r.id !== current?.id && r.type === current?.type);
  const others = records.filter((r) => r.id !== current?.id && r.type !== current?.type);
  return [...sameType, ...others].slice(0, limit);
}

export function searchRecords(
  query: string,
  category: Category | 'All',
  records: ArchiveRecord[] = archiveRecords,
): ArchiveRecord[] {
  const q = query.trim().toLowerCase();
  return records.filter((record) => {
    const matchesCategory = category === 'All' || record.type === category;
    if (!matchesCategory) return false;
    if (!q) return true;
    const haystack = [
      record.title,
      record.description,
      record.year,
      record.type,
      record.language,
      record.source,
      record.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function countByCategory(
  category: Category | 'All',
  records: ArchiveRecord[] = archiveRecords,
): number {
  return category === 'All'
    ? records.length
    : records.filter((record) => record.type === category).length;
}

/** Kiosk landing tiles: label → route category */
export const COLLECTION_TILES: { label: string; category: Category; image: string; blurb: string }[] =
  [
    {
      label: 'MANUSCRIPTS',
      category: 'Manuscripts',
      image: 'images/manuscript-hand-1.jpg',
      blurb: 'Handwritten folios, drafts and annotated leaves',
    },
    {
      label: 'WRITINGS',
      category: 'Writings',
      image: 'images/ambedkar-reading-constitution.jpg',
      blurb: 'Published papers, books and working texts',
    },
    {
      label: 'SPEECHES',
      category: 'Speeches',
      image: 'images/constitution-presentation-1949.jpg',
      blurb: 'Addresses, proceedings and event registers',
    },
    {
      label: 'PHOTOGRAPHS',
      category: 'Photographs',
      image: 'images/ambedkar-rajgruh.jpg',
      blurb: 'Portraits, gatherings and official groups',
    },
  ];
