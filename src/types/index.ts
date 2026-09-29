export type Category =
  | 'Manuscripts'
  | 'Writings'
  | 'Speeches'
  | 'Photographs'
  | 'Historical Documents';

export interface ArchiveRecord {
  id: string;
  title: string;
  year: string;
  type: Category;
  description: string;
  language: string;
  source: string;
  tags: string[];
  image: string;
  text: string;
  isSample?: boolean;
  credit?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  detail: string;
  recordId: string;
}
