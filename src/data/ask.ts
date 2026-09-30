import type { ArchiveRecord } from '../types';
import { archiveRecords, FEATURED_IDS, getRecord, relatedRecords } from './index';

/**
 * Ask the Archive — curated, deterministic answers for the prototype.
 *
 * Every answer is composed from catalogue fields already held in the archive
 * data (titles, years, descriptions, tags). No AI service and no external API
 * is involved, and no historical fact is invented beyond what the records
 * themselves state.
 */

export interface AskStats {
  found: number;
  relevant: number;
  topics: number;
  languages: number;
}

export interface AskAnswer {
  answer: string;
  sources: ArchiveRecord[];
  pool: ArchiveRecord[];
  stats: AskStats;
  unknown: boolean;
}

interface Topic {
  keywords: string[];
  ids: string[];
  text: (records: ArchiveRecord[]) => string;
}

function listTitles(records: ArchiveRecord[]): string {
  return records.map((r) => `"${r.title}" (${r.year})`).join(', ');
}

function statsFor(pool: ArchiveRecord[], sources: ArchiveRecord[]): AskStats {
  const topics = new Set<string>();
  const languages = new Set<string>();
  for (const record of pool) {
    for (const tag of record.tags) topics.add(tag);
    languages.add(record.language);
  }
  return {
    found: pool.length,
    relevant: sources.length,
    topics: topics.size,
    languages: languages.size,
  };
}

function resolve(ids: string[], records: ArchiveRecord[]): ArchiveRecord[] {
  return ids
    .map((id) => getRecord(id, records))
    .filter((record): record is ArchiveRecord => Boolean(record));
}

/** Answers never show a single lonely source — pad with related holdings. */
function padSources(matched: ArchiveRecord[], records: ArchiveRecord[]): ArchiveRecord[] {
  const sources = matched.slice(0, 4);
  if (sources.length >= 2 || sources.length === 0) return sources;
  for (const candidate of relatedRecords(sources[0].id, 3, records)) {
    if (sources.length >= 2) break;
    if (!sources.some((s) => s.id === candidate.id)) sources.push(candidate);
  }
  return sources;
}

const TOPICS: Topic[] = [
  {
    keywords: [
      'constitution',
      'constitutional',
      'constituent',
      'drafting',
      'assembly',
      'preamble',
      'fundamental',
    ],
    ids: ['ms-001', 'sp-002', 'ph-003'],
    text: () =>
      'Three records in the collection relate to the Constitution. "Draft Notes on Constitutional Reform — Sample Folio" (c. 1946) is a working folio from the period of constitutional negotiations. "Presentation of the Draft Constitution in the Constituent Assembly — Sample Transcript" (1948) records the occasion on which the draft of the Constitution of India was placed before the Constituent Assembly. "The First Cabinet of Independent India" (1947) is the official group photograph in which Dr. B. R. Ambedkar served as Law and Justice Minister.',
  },
  {
    keywords: ['mahad', 'chavadar', 'satyagraha', 'tank'],
    ids: ['sp-001', 'hd-003'],
    text: () =>
      'Two records connect to the Mahad Satyagraha of March 1927. "Address at the Mahad Satyagraha — Sample Transcript" (1927) is the event file for the gathering that asserted the right of untouchable communities to use the Chavadar tank, and "Chavadar Tank Site Documentation, Mahad" (1927 / surveyed later) is the heritage-location site file for the tank itself.',
  },
  {
    keywords: [
      'caste',
      'equality',
      'social',
      'society',
      'reform',
      'untouchable',
      'discrimination',
      'annihilation',
    ],
    ids: ['wr-002', 'wr-001', 'ms-003', 'sp-003'],
    text: () =>
      'Four records address caste, social reform and equality. "Annihilation of Caste — Working Text Record" (1936) groups the prepared address and its later editions under one work identifier. "Castes in India: Their Mechanism, Genesis and Development" (1916) is the bibliographic record for the paper presented at Columbia University. "Annotated Marginal Notes on Caste and Society — Sample Folio" (c. 1936) preserves struck passages and margin cross-references rather than cleaning them, and "Public Address on Social Equality — Sample Transcript" (c. 1950) is a public-meetings speech entry.',
  },
  {
    keywords: [
      'education',
      'school',
      'college',
      'university',
      'academic',
      'learning',
      'columbia',
      'study',
      'studies',
    ],
    ids: ['wr-001', 'wr-003'],
    text: () =>
      'The closest holdings on academic work and authored texts are "Castes in India: Their Mechanism, Genesis and Development" (1916), catalogued as a paper presented at Columbia University with its journal reprints held in the collection, and "The Buddha and His Dhamma — Working Draft Record" (c. 1957), held as typescript leaves with interleaved corrections. No record in this prototype is catalogued specifically under education.',
  },
  {
    keywords: ['speech', 'address', 'transcript', 'spoken', 'remarks'],
    ids: ['sp-001', 'sp-002', 'sp-003'],
    text: () =>
      'The speech register holds three transcript records: "Address at the Mahad Satyagraha — Sample Transcript" (1927), relating to the March 1927 gathering at the Chavadar tank; "Presentation of the Draft Constitution in the Constituent Assembly — Sample Transcript" (1948); and "Public Address on Social Equality — Sample Transcript" (c. 1950). Transcript fields in this prototype carry placeholder text only.',
  },
  {
    keywords: [
      'manuscript',
      'handwritten',
      'handwriting',
      'folio',
      'letter',
      'correspondence',
      'marginalia',
      'draft',
    ],
    ids: ['ms-001', 'ms-002', 'ms-003'],
    text: () =>
      'Three manuscript records are catalogued. "Draft Notes on Constitutional Reform — Sample Folio" (c. 1946) is written in a single hand with frequent interlineations on ruled paper. "Handwritten Correspondence on Social Reform — Sample Letter" (c. 1943) is a single sheet with a visible seal impression and postal marks. "Annotated Marginal Notes on Caste and Society — Sample Folio" (c. 1936) keeps struck passages visible by design.',
  },
  {
    keywords: ['photograph', 'photo', 'portrait', 'picture', 'image', 'group'],
    ids: ['ph-001', 'ph-002', 'ph-003'],
    text: () =>
      'Three photographic records are held: "Studio Portrait of Dr. B. R. Ambedkar" (c. 1950); "At Rajgruh, Dadar, Bombay — With Associates" (c. 1950), a group photograph at the Rajgruh residence with provisional sitters; and "The First Cabinet of Independent India" (1947), the official cabinet photograph. Identifications across the photo archive are marked provisional pending confirmation against the original caption sheets.',
  },
  {
    keywords: ['buddha', 'buddhism', 'dhamma', 'dharma', 'religion', 'religious'],
    ids: ['wr-003'],
    text: () =>
      '"The Buddha and His Dhamma — Working Draft Record" (c. 1957) is the collection\'s record for a later work, held as typescript leaves with interleaved corrections and a working table of contents. It is the only record in this prototype connected to Buddhism and the late writings.',
  },
  {
    keywords: [
      'bharat ratna',
      'ratna',
      'award',
      'honour',
      'honor',
      'stamp',
      'medal',
      'philatelic',
      'philately',
      'commemorative',
    ],
    ids: ['hd-001', 'hd-002'],
    text: () =>
      'Two official-document records cover national honours. "Bharat Ratna Investiture Record, 1990" (1990) documents the posthumous award of the Bharat Ratna, and "Commemorative Postal Issue Honouring Dr. B. R. Ambedkar, 1991" (1991) catalogues the commemorative stamp with denomination, print run and philatelic references.',
  },
  {
    keywords: [
      'ambedkar',
      'archive',
      'collection',
      'heritage',
      'legacy',
      'history',
      'museum',
      'catalog',
      'catalogue',
    ],
    ids: FEATURED_IDS,
    text: (records) =>
      `A cross-section of the collection: ${listTitles(records)}. Browse the Archive to filter the full set by manuscripts, writings, speeches, photographs and historical documents.`,
  },
];

function scoreTopic(topic: Topic, query: string): number {
  let score = 0;
  for (const keyword of topic.keywords) {
    if (query.includes(keyword)) score += keyword.length;
  }
  return score;
}

/** Year queries ("1940s", "1947") resolve against the catalogue year field. */
function answerForYear(query: string, records: ArchiveRecord[]): AskAnswer | null {
  const match = query.match(/19\d{2}/);
  if (!match) return null;
  const prefix = match[0].slice(0, 3);
  const pool = records.filter((record) => record.year.includes(prefix));
  if (pool.length === 0) return null;
  const sources = pool.slice(0, 4);
  return {
    answer: `${pool.length} ${pool.length === 1 ? 'record is' : 'records are'} dated to the ${prefix}0s: ${listTitles(sources)}.`,
    sources,
    pool,
    stats: statsFor(pool, sources),
    unknown: false,
  };
}

export function answerQuery(
  query: string,
  records: ArchiveRecord[] = archiveRecords,
): AskAnswer {
  const normalised = query.trim().toLowerCase();
  if (!normalised) {
    return { answer: '', sources: [], pool: [], stats: statsFor([], []), unknown: true };
  }

  const byYear = answerForYear(normalised, records);
  if (byYear) return byYear;

  let best: Topic | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    const score = scoreTopic(topic, normalised);
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  if (!best) {
    return { answer: '', sources: [], pool: [], stats: statsFor([], []), unknown: true };
  }

  const pool = resolve(best.ids, records);
  const sources = padSources(pool, records);
  return {
    answer: best.text(pool),
    sources,
    pool,
    stats: statsFor(pool, sources),
    unknown: false,
  };
}

export function answerDocument(
  record: ArchiveRecord,
  records: ArchiveRecord[] = archiveRecords,
): AskAnswer {
  const related = relatedRecords(record.id, 3, records);
  const facts = `"${record.title}" is catalogued in the "${record.type}" series, dated ${record.year} and held in ${record.source}. ${record.description} The entry is tagged ${record.tags.join(', ')}${
    record.isSample ? ' and is flagged as sample catalogue data for this prototype' : ''
  }.`;
  const answer = related.length
    ? `${facts} Related holdings in the collection: ${listTitles(related)}.`
    : facts;
  const pool = [record, ...related];
  return {
    answer,
    sources: related,
    pool,
    stats: statsFor(pool, related),
    unknown: false,
  };
}
