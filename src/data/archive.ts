import type { ArchiveRecord } from '../types';

const OCR_NOTE = `

[SAMPLE OCR OUTPUT — demonstration content]
This panel simulates machine-extracted text from the digitised page. In the production
system it would contain raw OCR output with reading order, confidence values and
bounding-box highlights. The wording above is generic sample text prepared for the
prototype and must not be read as a verified transcription of any historical document.`;

export const archiveRecords: ArchiveRecord[] = [
  /* ---------------------------- MANUSCRIPTS ---------------------------- */
  {
    id: 'ms-001',
    title: 'Draft Notes on Constitutional Reform — Sample Folio',
    year: 'c. 1946',
    type: 'Manuscripts',
    description:
      'Sample manuscript record representing a working folio from the period of constitutional negotiations. Handwriting, ruling and paper stock are catalogued here as archival attributes.',
    language: 'English',
    source: 'Sample Archive Set A — Manuscript Room',
    tags: ['constitution', 'draft', 'handwriting', 'folio'],
    image: 'images/manuscript-hand-1.jpg',
    text: `Folio 1 recto. Written in dark ink on ruled paper, three margins preserved.
Left margin carries a numbered column of annotations; body text runs in a single
hand with frequent interlineations. Paper shows light foxing along the upper edge
and one repaired tear at the fore-edge. Catalogued as a demonstration entry for the
digital manuscript viewer, with page geometry, ink coverage and script style recorded
for search.` + OCR_NOTE,
    isSample: true,
    credit: 'Illustrative handwriting specimen — public domain (Wikimedia Commons)',
  },
  {
    id: 'ms-002',
    title: 'Handwritten Correspondence on Social Reform — Sample Letter',
    year: 'c. 1943',
    type: 'Manuscripts',
    description:
      'Sample record for a personal letter-format manuscript, catalogued to demonstrate correspondence metadata: addressee fields, sealing, postal marks and paper condition.',
    language: 'English',
    source: 'Sample Archive Set A — Correspondence Drawer',
    tags: ['letter', 'correspondence', 'reform', 'handwriting'],
    image: 'images/manuscript-hand-2.jpg',
    text: `Single sheet, folded twice, addressed on the verso. Seal impression visible at the
lower fold. The recto carries eleven lines of running hand with a dated subscription
at the foot. Foxing is present along the fold lines; the sheet has been de-acidified
and flattened. Metadata recorded for prototype search only — no verified transcript
of an original letter is presented in this demonstration.` + OCR_NOTE,
    isSample: true,
    credit: 'Illustrative handwritten letter — public domain (Wikimedia Commons)',
  },
  {
    id: 'ms-003',
    title: 'Annotated Marginal Notes on Caste and Society — Sample Folio',
    year: 'c. 1936',
    type: 'Manuscripts',
    description:
      'Sample folio record illustrating marginalia: cross-references, struck passages and later additions, all of which are preserved rather than cleaned in archival imaging.',
    language: 'English',
    source: 'Sample Archive Set B — Research Papers',
    tags: ['marginalia', 'caste', 'society', 'annotation'],
    image: 'images/manuscript-hand-3.jpg',
    text: `Body text occupies the central block; the outer margin carries a vertical run of
cross-references and two struck passages left visible by design. A second, lighter
hand appears in the head margin, suggesting later review. Imaging captured at 600 dpi
with raking light to record pen pressure. Presented as a prototype entry for the
manuscript reading experience.` + OCR_NOTE,
    isSample: true,
    credit: 'Illustrative handwriting specimen — public domain (Wikimedia Commons)',
  },

  /* ----------------------------- WRITINGS ------------------------------ */
  {
    id: 'wr-001',
    title: 'Castes in India: Their Mechanism, Genesis and Development',
    year: '1916',
    type: 'Writings',
    description:
      'Record for the paper presented at Columbia University, catalogued with publication history, journal appearances and later reprint editions held in the collection.',
    language: 'English',
    source: 'Sample Bibliographic Record — Printed Works Shelf',
    tags: ['caste', 'columbia', 'paper', 'anthropology'],
    image: 'images/ambedkar-1950.jpg',
    text: `BIBLIOGRAPHIC ENTRY
Title as catalogued. Author field, year of presentation, and subsequent periodical
reprints are recorded in the authority file. Physical copies in the collection are
held in bound periodical volumes with library stamps on the flyleaf.
[Prototype note] The text panel demonstrates how a scanned article would be displayed
alongside its catalogue record; no reproduction of the article text is included here.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },
  {
    id: 'wr-002',
    title: 'Annihilation of Caste — Working Text Record',
    year: '1936',
    type: 'Writings',
    description:
      'Bibliographic record for the prepared address, with later editions and translations catalogued as separate holdings under the same work identifier.',
    language: 'English',
    source: 'Sample Bibliographic Record — Printed Works Shelf',
    tags: ['caste', 'address', 'editions', 'social reform'],
    image: 'images/ambedkar-portrait-3.jpg',
    text: `WORK RECORD
Uniform title with linked editions: prepared address, later published versions, and
translated editions are grouped under one work identifier. Each holding carries its
own shelfmark, condition note and digitisation status.
[Prototype note] Sample catalogue text generated for the interface demonstration.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },
  {
    id: 'wr-003',
    title: 'The Buddha and His Dhamma — Working Draft Record',
    year: 'c. 1957',
    type: 'Writings',
    description:
      'Record for the manuscript of a later work, held as typescript leaves with interleaved corrections and a working table of contents.',
    language: 'English',
    source: 'Sample Bibliographic Record — Late Papers',
    tags: ['buddhism', 'dhamma', 'typescript', 'late work'],
    image: 'images/ambedkar-portrait-30.jpg',
    text: `FORMAT NOTE
Typescript leaves, carbon copies present, with manuscript corrections in ink at
intervals. A working table of contents is filed at the front; pagination is
irregular across the sequence. Conservation status: stable, stored in inert folders.
[Prototype note] Sample description prepared for the Phase 1 interface.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },

  /* ----------------------------- SPEECHES ------------------------------ */
  {
    id: 'sp-001',
    title: 'Address at the Mahad Satyagraha — Sample Transcript',
    year: '1927',
    type: 'Speeches',
    description:
      'Record relating to the Mahad Satyagraha of March 1927, when a public gathering asserted the right of untouchable communities to use the Chavadar tank.',
    language: 'Marathi / English (catalogued)',
    source: 'Sample Speech Register — Event Files',
    tags: ['mahad', 'satyagraha', 'chavadar tank', '1927'],
    image: 'images/mahad-flyer-1927.jpg',
    text: `EVENT FILE
Event name, date, place and organising body recorded in the event register. A
contemporary printed handbill survives and is catalogued as a companion item.
[Sample transcript placeholder] The transcript field in the full system would carry a
verified, sourced text of the address. No transcript is asserted here — this prototype
displays placeholder text only.` + OCR_NOTE,
    isSample: true,
    credit: 'Printed handbill, 1927 — public domain (Wikimedia Commons)',
  },
  {
    id: 'sp-002',
    title:
      'Presentation of the Draft Constitution in the Constituent Assembly — Sample Transcript',
    year: '1948',
    type: 'Speeches',
    description:
      'Record for the occasion on which, as Chairman of the Drafting Committee, the draft of the Constitution of India was placed before the Constituent Assembly.',
    language: 'English',
    source: 'Sample Speech Register — Assembly Proceedings',
    tags: ['constituent assembly', 'drafting committee', 'constitution', '1948'],
    image: 'images/constitution-presentation-1949.jpg',
    text: `PROCEEDING RECORD
Reference number, sitting date, speaker register and accompanying photographs are
linked to this record. A companion photograph shows the final draft being presented
on 25 November 1949.
[Sample transcript placeholder] Text shown here is placeholder content created for the
prototype and is not a verified record of parliamentary proceedings.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph, 1949 (Wikimedia Commons)',
  },
  {
    id: 'sp-003',
    title: 'Public Address on Social Equality — Sample Transcript',
    year: 'c. 1950',
    type: 'Speeches',
    description:
      'Placeholder record for a public address, included to demonstrate speech entries with venue, audience and audio-visual companion fields.',
    language: 'English (catalogued)',
    source: 'Sample Speech Register — Public Meetings',
    tags: ['equality', 'public meeting', 'address', 'demo'],
    image: 'images/ambedkar-followers-panjab.jpg',
    text: `RECORD FIELDS
Venue, estimated audience, sound-recording status and photographic coverage would be
recorded here in the full catalogue.
[Sample transcript placeholder] This entry exists to demonstrate the speech layout of
the archive. The text is generic sample content and carries no historical attribution.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },

  /* ---------------------------- PHOTOGRAPHS ---------------------------- */
  {
    id: 'ph-001',
    title: 'Studio Portrait of Dr. B. R. Ambedkar',
    year: 'c. 1950',
    type: 'Photographs',
    description:
      'Formal portrait study, catalogued with print size, emulsion, photographer attribution where known, and the provenance of the surviving print.',
    language: 'Not applicable',
    source: 'Sample Photo Archive — Print Collection',
    tags: ['portrait', 'studio', 'print', 'iconography'],
    image: 'images/ambedkar-portrait-hi2.jpg',
    text: `PHYSICAL DESCRIPTION
Gelatin silver print, later copy negative present. Recto shows light surface
scratching near the lower margin; verso carries an undated studio impression.
Provenance: sample entry assembled for the prototype collection.
[Note] No caption beyond descriptive metadata is asserted for this image.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },
  {
    id: 'ph-002',
    title: 'At Rajgruh, Dadar, Bombay — With Associates',
    year: 'c. 1950',
    type: 'Photographs',
    description:
      'Candid group photograph taken at the residence known as Rajgruh, catalogued with location, sitters (where identified) and condition notes.',
    language: 'Not applicable',
    source: 'Sample Photo Archive — Personal Papers',
    tags: ['rajgruh', 'bombay', 'group', 'residence'],
    image: 'images/ambedkar-rajgruh.jpg',
    text: `CATALOGUE DETAIL
Location field: residence at Dadar, Bombay. Sitters listed as "identifications
provisional" pending verification by an archivist. Print edges slightly trimmed;
tonal range well preserved.
[Note] Descriptive metadata only; identifications are marked provisional.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph (Wikimedia Commons)',
  },
  {
    id: 'ph-003',
    title: 'The First Cabinet of Independent India',
    year: '1947',
    type: 'Photographs',
    description:
      'Group photograph of the first cabinet of independent India, in which Dr. B. R. Ambedkar served as Law and Justice Minister.',
    language: 'Not applicable',
    source: 'Sample Photo Archive — Official Records',
    tags: ['cabinet', 'ministry', '1947', 'independence'],
    image: 'images/first-cabinet-1947.jpg',
    text: `CAPTION FIELD
Official group photograph. Seating order and individual identifications are recorded
in the accompanying caption sheet, transcribed here in summary form for the prototype.
[Note] Identifications should be confirmed against the original caption sheet before
publication.` + OCR_NOTE,
    isSample: true,
    credit: 'Public domain photograph, 1947 (Wikimedia Commons)',
  },

  /* ------------------------ HISTORICAL DOCUMENTS ----------------------- */
  {
    id: 'hd-001',
    title: 'Bharat Ratna Investiture Record, 1990',
    year: '1990',
    type: 'Historical Documents',
    description:
      'Record documenting the posthumous award of the Bharat Ratna in 1990, held alongside related notification material in the official documents series.',
    language: 'English / Hindi',
    source: 'Sample Official Documents Series',
    tags: ['bharat ratna', 'award', '1990', 'honour'],
    image: 'images/bharat-ratna-medal.jpg',
    text: `DOCUMENT SUMMARY
Series: national honours. Item type: medal and accompanying notification. Condition:
excellent; stored in a purpose-made case. Digitised for the prototype as a
representative object record with obverse and reverse imagery.
[Note] Sample summary text; consult official gazette sources for authoritative detail.` + OCR_NOTE,
    isSample: true,
    credit: 'Bharata Ratna Medal — CC BY-SA 4.0 (Wikimedia Commons)',
  },
  {
    id: 'hd-002',
    title: 'Commemorative Postal Issue Honouring Dr. B. R. Ambedkar, 1991',
    year: '1991',
    type: 'Historical Documents',
    description:
      'Record for the commemorative postage stamp issued in 1991, catalogued with denomination, print run and philatelic catalogue references.',
    language: 'English / Hindi',
    source: 'Sample Philatelic Series',
    tags: ['stamp', 'philately', 'commemorative', '1991'],
    image: 'images/stamp-ambedkar-1991.jpg',
    text: `PHILATELIC RECORD
Denomination, issue date, perforation and printer fields recorded. The specimen shown
is a reference image used for the prototype catalogue entry.
[Note] Values and issue details are placeholder metadata for demonstration.` + OCR_NOTE,
    isSample: true,
    credit: 'Commemorative stamp — GODL India (Wikimedia Commons)',
  },
  {
    id: 'hd-003',
    title: 'Chavadar Tank Site Documentation, Mahad',
    year: '1927 / surveyed later',
    type: 'Historical Documents',
    description:
      'Site documentation record for the Chavadar tank at Mahad, associated with the satyagraha of March 1927 and preserved here as a heritage-location file.',
    language: 'Marathi / English (catalogued)',
    source: 'Sample Site Records — Heritage Locations',
    tags: ['mahad', 'chavadar tank', 'site', 'satyagraha'],
    image: 'images/mahad-krantibhoomi.jpg',
    text: `SITE FILE
Location, access notes, associated events and photographic survey are grouped under
this site record. Related event file: the gathering at Mahad, March 1927.
[Note] Descriptive site metadata assembled for the prototype; verification against
survey records is pending.` + OCR_NOTE,
    isSample: true,
    credit: 'Site photograph — CC BY-SA 3.0 (Wikimedia Commons)',
  },
];

export default archiveRecords;
