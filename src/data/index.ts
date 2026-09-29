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

export const FEATURED_IDS = ['sp-002', 'ms-002', 'hd-001'];

export function getRecord(id: string | undefined): ArchiveRecord | undefined {
  if (!id) return undefined;
  return archiveRecords.find((record) => record.id === id);
}

export function getFeatured(): ArchiveRecord[] {
  return FEATURED_IDS.map((id) => getRecord(id)).filter(
    (record): record is ArchiveRecord => Boolean(record),
  );
}

export function relatedRecords(id: string, limit = 3): ArchiveRecord[] {
  const current = getRecord(id);
  const sameType = archiveRecords.filter((r) => r.id !== id && r.type === current?.type);
  const others = archiveRecords.filter((r) => r.id !== id && r.type !== current?.type);
  return [...sameType, ...others].slice(0, limit);
}

export function searchRecords(query: string, category: Category | 'All'): ArchiveRecord[] {
  const q = query.trim().toLowerCase();
  return archiveRecords.filter((record) => {
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

export function countByCategory(category: Category | 'All'): number {
  return category === 'All'
    ? archiveRecords.length
    : archiveRecords.filter((record) => record.type === category).length;
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
