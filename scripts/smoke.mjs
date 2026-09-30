import { chromium } from 'playwright-core';

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5173';
const SHOT = process.env.SHOT_DIR || './shots';

let pass = 0;
let fail = 0;
const problems = [];

function ok(cond, label) {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    problems.push(label);
    console.log(`  FAIL  ${label}`);
  }
}

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

const runtimeErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`);
});
page.on('pageerror', (err) => runtimeErrors.push(`pageerror: ${err.message}`));
page.on('requestfailed', (req) => {
  const failure = (req.failure() && req.failure().errorText) || '';
  if (req.url().includes('fonts.g') || failure.includes('ERR_ABORTED')) return;
  runtimeErrors.push(`requestfailed: ${req.url()}`);
});
page.on('response', (res) => {
  if (res.status() >= 400 && !res.url().includes('fonts.g')) {
    runtimeErrors.push(`http ${res.status()}: ${res.url()}`);
  }
});

const settle = (ms = 900) => page.waitForTimeout(ms);
const go = async (path) => {
  await page.goto(BASE + path, { waitUntil: 'load', timeout: 20000 });
  await settle(1100);
};

/* hermetic start — clear preferences left behind by an earlier run */
await page.goto(`${BASE}/kiosk`, { waitUntil: 'load', timeout: 20000 });
await page.evaluate(() => {
  ['ahh.language', 'ahh.largeText', 'ahh.highContrast', 'ahh.reduceMotion'].forEach((key) =>
    window.localStorage.removeItem(key),
  );
});
await page.reload({ waitUntil: 'load', timeout: 20000 });
await settle(1100);

/* ------------------------------- 1. KIOSK -------------------------------- */
console.log('\n[KIOSK /kiosk]');
await go('/kiosk');
const heroH1 = await page.locator('h1').first().innerText();
ok(heroH1.includes('AMBEDKAR') && heroH1.includes('HERITAGE HUB'), 'brand hero headline renders');
ok((await page.getByRole('link', { name: /explore the archive/i }).count()) >= 1, 'EXPLORE THE ARCHIVE CTA present');
ok((await page.locator('a[href="/ask"]:has-text("Ask the Archive")').count()) >= 1, 'ASK THE ARCHIVE CTA present');
ok((await page.locator('a[href="/digitize"]:has-text("Digitize a document")').count()) >= 1, 'DIGITIZE A DOCUMENT CTA present');
ok((await page.getByText('MANUSCRIPTS').count()) > 0, 'collection tiles present');
ok((await page.getByText('Have a physical document?').count()) > 0, 'QR band section present');
ok(
  (await page.locator('section:has-text("Have a physical document?") a[href="/digitize"]').count()) >= 1,
  'QR band links the digitizer',
);
ok((await page.getByText('Featured Archive').count()) > 0, 'featured section present');
const featuredLinks = await page.locator('section:has-text("Featured Archive") a[href^="/document/"]').count();
ok(featuredLinks === 4, `featured shows 4 records (got ${featuredLinks})`);
await page.screenshot({ path: `${SHOT}/01-kiosk.png`, fullPage: false });

// collection tile navigates with filter (target the tile link itself — the
// featured grid above it also renders records whose label is "Speeches")
await page.locator('a[href*="category=Speeches"]').click();
await settle(1000);
ok(page.url().includes('/archive') && page.url().includes('category=Speeches'), `tile navigates with filter (${page.url()})`);
const speechCards = await page.locator('main article').count();
ok(speechCards === 3, `speeches filter returns 3 records (got ${speechCards})`);

/* ------------------------------- 2. ARCHIVE ------------------------------ */
console.log('\n[ARCHIVE /archive]');
await go('/archive');
const totalCards = await page.locator('main article').count();
ok(totalCards === 15, `all 15 records listed (got ${totalCards})`);
await page.screenshot({ path: `${SHOT}/02-archive.png` });

// category filter
await page.getByRole('button', { name: /^Manuscripts/ }).click();
await settle(500);
const msCards = await page.locator('main article').count();
ok(msCards === 3, `Manuscripts filter -> 3 (got ${msCards})`);
ok(page.url().includes('category=Manuscripts'), 'category written to URL');

// search actually filters
await page.getByRole('button', { name: /^All/ }).click();
await page.getByRole('searchbox').fill('constitution');
await settle(500);
const searchHits = await page.locator('main article').count();
ok(searchHits > 0 && searchHits < 15, `search "constitution" narrows results (${searchHits}/15)`);
ok((await page.getByText(/Matching/).count()) > 0, 'active query displayed');

// empty state
await page.getByRole('searchbox').fill('zzzz-no-match');
await settle(500);
ok((await page.getByText('No records found').count()) > 0, 'empty state appears for no matches');
await page.getByRole('button', { name: /reset search/i }).click();
await settle(500);
ok((await page.locator('main article').count()) === 15, 'reset restores full collection');

// open a document
await page.getByRole('searchbox').fill('mahad');
await settle(500);
await page.locator('main article a').first().click();
await settle(1200);
ok(page.url().includes('/document/'), `card opens document viewer (${page.url()})`);

/* --------------------------- 3. DOCUMENT VIEWER -------------------------- */
console.log('\n[DOCUMENT /document/:id]');
await go('/document/ms-001');
ok((await page.getByRole('heading', { level: 1 }).innerText()).includes('Draft Notes'), 'record title renders');
ok((await page.getByText('Document Text').count()) > 0, 'document text section present');
ok((await page.getByText('Related Records').count()) > 0, 'related records section present');
ok((await page.getByText('SAMPLE', { exact: true }).count()) > 0, 'sample marker shown');
await page.screenshot({ path: `${SHOT}/03-document.png` });

// modals
await page.getByRole('button', { name: /view fullscreen/i }).click();
await settle(600);
ok((await page.getByRole('dialog').count()) === 1, 'fullscreen modal opens');
await page.keyboard.press('Escape');
await settle(500);
ok((await page.getByRole('dialog').count()) === 0, 'escape closes modal');

await page.getByRole('button', { name: /read text/i }).click();
await settle(600);
ok((await page.getByText('Sample extracted text — not a verified transcription').count()) > 0, 'read text panel shows sample warning');
await page.getByRole('button', { name: 'Close', exact: true }).click();
await settle(400);

await page.getByRole('link', { name: /ask about this/i }).click();
await page.waitForURL('**/ask?doc=ms-001', { timeout: 8000 });
await settle(1600);
ok(
  (await page.getByRole('heading', { level: 1 }).innerText()).includes('Ask the Archive'),
  'ask entry opens /ask with document context',
);
ok(
  (await page.locator('section:has(h2)').first().innerText()).includes('Draft Notes on Constitutional Reform'),
  'current document strip rendered',
);

// unknown id
await go('/document/does-not-exist');
ok((await page.getByText('could not be found').count()) > 0, 'unknown id shows fallback');

// related record navigation
await go('/document/ms-001');
await page.getByRole('link', { name: /related archive record/i }).first().click().catch(() => {});
await settle(900);

/* ------------------------------- 4. TIMELINE ----------------------------- */
console.log('\n[TIMELINE /timeline]');
await go('/timeline');
const events = await page.locator('ol li').count();
ok(events === 10, `10 timeline entries (got ${events})`);
await page.screenshot({ path: `${SHOT}/04-timeline.png` });

const secondEvent = page.locator('ol li').nth(1);
await secondEvent.getByRole('button').click();
await settle(700);
ok((await secondEvent.getByText('Academic Work at Columbia University').count()) > 0, 'event expands in place');
ok((await secondEvent.getByRole('link', { name: /related archive record/i }).count()) === 1, 'expanded event links related record');
await secondEvent.getByRole('button').click();
await settle(700);
ok((await secondEvent.getByText('Academic Work at Columbia University').count()) === 1, 'event collapses again');
await secondEvent.getByRole('button').click();
await settle(700);

/* --------------------------- 5. NAV + CONTROLS --------------------------- */
console.log('\n[NAVIGATION + CONTROLS]');
await go('/kiosk');
await page.getByRole('link', { name: 'Timeline', exact: true }).first().click();
await settle(900);
ok(page.url().includes('/timeline'), 'navbar Timeline link works');
await page.getByRole('link', { name: 'Home', exact: true }).first().click();
await settle(900);
ok(page.url().includes('/kiosk'), 'navbar Home link works');
await page.getByRole('link', { name: 'Explore Archive', exact: true }).first().click();
await settle(900);
ok(page.url().includes('/archive'), 'navbar Explore Archive link works');

// language selector (EN -> HI -> EN). The button is addressed by its listbox
// popup role so the switch works whatever language the label itself is in.
const langButton = page.locator('button[aria-haspopup="listbox"]');
await langButton.click();
await settle(400);
await page.getByRole('option', { name: /हिन्दी/ }).click();
await settle(700);
ok((await langButton.innerText()).includes('HI'), 'language selector updates');
ok(await page.evaluate(() => document.documentElement.lang) === 'hi', 'html lang switches with language');
const placeholderHindi = await page.getByRole('searchbox').getAttribute('placeholder');
ok(
  Boolean(placeholderHindi) && placeholderHindi !== 'Search the heritage archive…',
  `archive copy switches language (${placeholderHindi})`,
);
ok((await page.getByText('संग्रह अन्वेषण').count()) > 0, 'navigation translated to Hindi');

// language survives a full reload
await go('/archive');
ok(await page.evaluate(() => document.documentElement.lang) === 'hi', 'language persists across reload');
ok((await langButton.innerText()).includes('HI'), 'selector reflects the stored language');

// restore English for the remaining English-labelled assertions
await langButton.click();
await settle(400);
await page.locator('[role="option"]').filter({ hasText: 'English' }).first().click();
await settle(700);
ok(await page.evaluate(() => document.documentElement.lang) === 'en', 'English restored');
ok((await page.getByText('Explore Archive').count()) > 0, 'English copy restored');

// ask + digitize entry points in the navbar
ok((await page.locator('header nav a[href="/ask"]').count()) === 1, 'navbar Ask link present');
ok((await page.locator('header nav a[href="/digitize"]').count()) === 1, 'navbar digitize CTA present');
await page.locator('header nav').getByRole('link', { name: 'Ask', exact: true }).click();
await settle(900);
ok(page.url().includes('/ask'), 'navbar Ask link works');
await go('/archive');

// accessibility toggles
await page.getByRole('button', { name: 'Accessibility options' }).first().click();
await settle(400);
await page.getByRole('button', { name: /Larger text/ }).click();
await settle(400);
ok(await page.evaluate(() => document.documentElement.classList.contains('fs-lg')), 'large text toggle applies');
await page.getByRole('button', { name: /High contrast/ }).click();
await settle(400);
ok(await page.evaluate(() => document.documentElement.classList.contains('hc')), 'high contrast toggle applies');
await page.getByRole('button', { name: /Reduce motion/ }).click();
await settle(400);
ok(await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')), 'reduce motion toggle applies');
// reset
await page.getByRole('button', { name: /Larger text/ }).click();
await page.getByRole('button', { name: /High contrast/ }).click();
await page.getByRole('button', { name: /Reduce motion/ }).click();
await settle(300);

// 404
await go('/nope');
ok((await page.getByText('does not exist').count()) > 0, '404 route renders');
await page.getByRole('link', { name: 'Kiosk home' }).click();
await settle(900);
ok(page.url().includes('/kiosk'), '404 recovery link works');

/* --------------------------- 6. MULTILINGUAL --------------------------- */
console.log('\n[MULTILINGUAL DOCUMENTS /document/:id]');
await go('/document/ms-001');
const panelBody = page.locator('.paper p.whitespace-pre-line');
ok((await page.getByRole('radiogroup').count()) >= 1, 'translation chip group present');
ok(
  (await page.getByRole('radio', { name: 'ORIGINAL', exact: true }).getAttribute('aria-checked')) === 'true',
  'ORIGINAL is the default chip in English',
);
const originalBody = (await panelBody.first().innerText()).trim();
ok(originalBody.includes('Folio 1 recto'), 'original source text shown');
ok((await page.getByText('DIGITAL ACCESS').count()) > 0, 'digital access card present');

await page.getByRole('radio', { name: 'हिन्दी', exact: true }).click();
await settle(800);
ok((await page.getByText('TRANSLATED TEXT').count()) > 0, 'TRANSLATED TEXT label appears');
ok((await page.getByText('MOCK TRANSLATION · SAMPLE').count()) > 0, 'mock translation badge appears');
const hindiBody = (await panelBody.first().innerText()).trim();
ok(hindiBody !== originalBody && hindiBody.includes('पृष्ठ 1'), 'Hindi document text replaces the original');
await page.screenshot({ path: `${SHOT}/10-document-hindi.png` });

await page.getByRole('radio', { name: 'ORIGINAL', exact: true }).click();
await settle(700);
ok((await panelBody.first().innerText()).trim() === originalBody, 'ORIGINAL chip restores the source text');

// alias + exhibit code
await go('/document/hd-003');
ok((await page.getByRole('heading', { level: 1 }).innerText()).includes('Chavadar'), 'aliased record resolves');
ok((await page.getByText('doc-001', { exact: true }).count()) > 0, 'exhibit code doc-001 displayed');

/* ------------------------------- 7. SCAN ------------------------------- */
console.log('\n[SCAN /scan]');
await go('/scan');
ok(
  (await page.getByRole('heading', { level: 1 }).innerText()).includes('Scan a heritage QR code'),
  'scan page renders',
);
ok((await page.getByText('Ready to scan').count()) > 0, 'idle status shown');
ok((await page.getByRole('button', { name: /START CAMERA/i }).count()) === 0, 'camera controls removed (QR-only scan)');
const scanQr = page.locator('canvas[data-qr="send"]');
ok((await scanQr.count()) === 1, 'scan frame shows a real QR canvas');
const scanQrValue = await scanQr.getAttribute('data-qr-value');
ok(
  typeof scanQrValue === 'string' && scanQrValue.includes('/send?p='),
  `QR encodes the phone upload link (${scanQrValue})`,
);
await page.screenshot({ path: `${SHOT}/11-scan.png` });

const status = page.getByLabel('Scanner status');
await page.getByRole('button', { name: /USE DEMO QR/i }).click();
await settle(300);
const stage1 = await status.innerText();
await settle(950);
const stage2 = await status.innerText();
await settle(900);
const stage3 = await status.innerText();
await settle(900);
const stage4 = await status.innerText();
const lower = (value) => value.toLowerCase();
ok(lower(stage1).includes('scanning'), `demo stage 1 (${stage1.trim()})`);
ok(lower(stage2).includes('detecting'), `demo stage 2 (${stage2.trim()})`);
ok(lower(stage3).includes('qr detected'), `demo stage 3 (${stage3.trim()})`);
ok(lower(stage4).includes('opening the digitizer'), `demo stage 4 (${stage4.trim()})`);

await page.waitForURL('**/digitize?auto=1', { timeout: 8000 });
ok(
  (await page.getByText('QR scan complete — opening the digitizer.').count()) > 0,
  'QR scan toast shown',
);

/* ------------------------- 8. OCR (real pipeline) ------------------------ */
console.log('\n[OCR /digitize + /ocr]');
// the demo QR above opened /digitize?auto=1, which runs the real OCR engine
const autoOverlay = await page
  .waitForSelector('text=Processing document', { timeout: 20000 })
  .then(() => true)
  .catch(() => false);
ok(autoOverlay, 'full-screen processing overlay shown for the auto run');
await page.getByText('DOCUMENT DIGITIZED').waitFor({ timeout: 90000 });
await settle(2400);
ok((await page.getByText('Detected language').count()) > 0, 'result metadata rendered');
ok((await page.getByText('Confidence').count()) > 0, 'confidence row rendered');
ok((await page.getByText('Automated OCR output', { exact: false }).count()) > 0, 'sample disclaimer present');
const autoTextOk = await page
  .waitForFunction(() => document.body.innerText.includes('CONSTITUTION OF INDIA'), null, { timeout: 20000 })
  .then(() => true)
  .catch(() => false);
ok(autoTextOk, 'real OCR extracted the sample document text');

const ocrPanels = page.locator('.paper p.whitespace-pre-line');
ok((await ocrPanels.count()) === 2, `extracted + translated panels rendered (${await ocrPanels.count()})`);
const extractedText = (await ocrPanels.first().innerText()).trim();
ok(extractedText.includes('CONSTITUTION OF INDIA'), 'extracted text revealed');
const hindiRadio = page.getByRole('radio', { name: 'हिन्दी', exact: true });
ok((await hindiRadio.count()) > 0, 'matched sample offers translation');
await hindiRadio.click();
await settle(800);
const ocrHindi = (await ocrPanels.nth(1).innerText()).trim();
ok(ocrHindi !== extractedText && ocrHindi.includes('भारत का संविधान'), 'OCR text translates to Hindi');
await page.screenshot({ path: `${SHOT}/13-ocr-done.png` });

await page.getByRole('button', { name: /ADD TO DIGITAL ARCHIVE/i }).click();
await settle(900);
ok(
  (await page.getByText('Document successfully added to the Heritage Archive.').count()) > 0,
  'archive toast shown',
);
const addedButton = page.getByRole('button', { name: /ADDED TO ARCHIVE/i });
ok((await addedButton.count()) === 1, 'button flips to ADDED TO ARCHIVE');
ok(await addedButton.isDisabled(), 'added button is disabled');
ok((await page.getByRole('link', { name: /VIEW IN ARCHIVE/i }).count()) > 0, 'VIEW IN ARCHIVE offered');

await page.getByRole('link', { name: /VIEW IN ARCHIVE/i }).click();
await settle(1300);
const cardsAfter = await page.locator('main article').count();
ok(cardsAfter === 16, `archive holds 16 records after adding (got ${cardsAfter})`);
ok((await page.getByText('Added this session').count()) > 0, 'session badge shown on the new record');
await page.screenshot({ path: `${SHOT}/14-archive-session.png` });

/* --------------------- 8b. DIGITIZER WAIT + ALIASES --------------------- */
console.log('\n[DIGITIZER WAIT STATE]');
await go('/digitize');
ok(
  (await page.getByRole('heading', { level: 1 }).innerText()).includes('Digitize a Heritage Document'),
  '/digitize renders the OCR desk',
);
const transferOnline = await page
  .waitForSelector('text=Waiting for a photo from a phone', { timeout: 12000 })
  .then(() => true)
  .catch(() => false);
ok(transferOnline, 'kiosk transfer link online — waiting for a photo');
ok((await page.locator('canvas[data-qr="send"]').count()) === 1, 'digitizer shows the phone-upload QR');
ok((await page.getByText('No photo yet').count()) > 0, 'idle prompt rendered');
ok((await page.getByRole('button', { name: /SIMULATE A PHOTO/i }).count()) === 1, 'SIMULATE A PHOTO offered');
ok((await page.getByText('Tesseract OCR runs on this kiosk').count()) > 0, 'engine note shown');
await page.screenshot({ path: `${SHOT}/12-ocr-idle.png` });

await go('/ocr');
ok(
  (await page.getByRole('heading', { level: 1 }).innerText()).includes('Digitize a Heritage Document'),
  '/ocr alias renders the same desk',
);

await go('/ocr?state=error');
ok((await page.getByText('OCR processing failed').count()) > 0, 'error state reachable via ?state=error');
ok((await page.getByRole('button', { name: 'RETRY' }).count()) > 0, 'RETRY offered');
ok((await page.getByRole('button', { name: /USE DEMO MODE/i }).count()) > 0, 'USE DEMO MODE offered');
await page.getByRole('button', { name: 'RETRY' }).click();
await settle(600);
ok((await page.getByText('No photo yet').count()) > 0, 'RETRY returns to the waiting state');

await page.getByRole('button', { name: /SIMULATE A PHOTO/i }).click();
const simOverlay = await page
  .waitForSelector('text=Processing document', { timeout: 20000 })
  .then(() => true)
  .catch(() => false);
ok(simOverlay, 'SIMULATE A PHOTO starts the pipeline');
await page.getByText('DOCUMENT DIGITIZED').waitFor({ timeout: 90000 });
ok((await page.getByText('Detected language').count()) > 0, 'simulated photo digitizes');

/* ---------------------------- 9. ENTRY POINTS -------------------------- */
console.log('\n[ENTRY POINTS /kiosk]');
await go('/kiosk');
ok((await page.getByRole('link', { name: /SCAN QR/i }).count()) > 0, 'kiosk quick-access scan card links /scan');
ok((await page.getByRole('link', { name: /DIGITIZE DOCUMENT/i }).count()) > 0, 'kiosk quick-access digitize card links /digitize');
ok((await page.getByRole('link', { name: /Scan QR/i }).count()) > 0, 'footer links the scanner');
ok((await page.getByRole('link', { name: /Digitize document/i }).count()) > 0, 'footer links the OCR desk');

/* --------------------------- 9b. ASK / DEMO / DIGITIZE ------------------ */
console.log('\n[ASK /ask]');
await go('/ask');
ok(
  (await page.getByRole('heading', { level: 1 }).innerText()).includes('Ask the Archive'),
  'ask page renders',
);
ok(
  (await page.locator('button:has-text("Show me records related to the Constitution.")').count()) === 1,
  'suggestion chips offered',
);
ok((await page.locator('text=Ask a question to see the records').count()) >= 1, 'context panel idle state');

await page.locator('button:has-text("Show me records related to the Constitution.")').click();
await settle(400);
ok(
  (await page.locator('[role="status"]:has-text("Searching the archive")').count()) === 1,
  'loading stages announced',
);
await page.waitForSelector('text=SOURCES FROM THE ARCHIVE', { timeout: 7000 });
ok(
  (await page.locator('article p').first().innerText()).includes('Constitution'),
  'answer rendered',
);
const sourceCards = await page.locator('article a[href^="/document/"]').count();
ok(sourceCards >= 2 && sourceCards <= 4, `2-4 source cards shown (${sourceCards})`);
const contextStats = (await page.locator('aside dl').innerText()).toLowerCase();
ok(
  /documents found/.test(contextStats) &&
    /relevant records/.test(contextStats) &&
    /topics/.test(contextStats) &&
    /languages/.test(contextStats),
  'archive context stats rendered',
);
await page.screenshot({ path: `${SHOT}/15-ask.png` });

await page.fill('#ask-question', 'quantum entanglement mechanics');
await page.click('button[type="submit"]');
await page.waitForSelector('text=No close match', { timeout: 7000 });
ok(
  (await page.locator('text=find a closely matching record').count()) >= 1,
  'unknown query shows fallback copy',
);

console.log('\n[DEMO TOUR /kiosk]');
await go('/kiosk');
await page.click('header button:has-text("DEMO")');
await settle(500);
ok((await page.locator('[role="dialog"]').count()) === 1, 'demo popover opens');
const demoSteps = await page.locator('[role="dialog"] ol button').count();
ok(demoSteps === 10, `10 tour steps (${demoSteps})`);
await page.click('[role="dialog"] button[aria-label="Close"]');
await settle(400);
ok((await page.locator('[role="dialog"]').count()) === 0, 'demo popover closes');

/* ------------------------ PHONE → KIOSK /send --------------------------- */
console.log('\n[PHONE → KIOSK /send]');
await go('/digitize');
const sendUrlValue = await page.locator('canvas[data-qr="send"]').getAttribute('data-qr-value');
ok(
  typeof sendUrlValue === 'string' && sendUrlValue.includes('/send?p='),
  `QR payload targets the send page (${sendUrlValue})`,
);

const phone = await ctx.newPage();
await phone.setViewportSize({ width: 390, height: 844 });
const phoneErrors = [];
phone.on('pageerror', (err) => phoneErrors.push(err.message));
phone.on('console', (msg) => {
  if (msg.type() === 'error') phoneErrors.push(`console: ${msg.text()}`);
});
await phone.goto(sendUrlValue, { waitUntil: 'load', timeout: 20000 });
await settle(1000);
ok(
  (await phone.getByRole('heading', { level: 1 }).innerText()).includes('Send a photo to the kiosk'),
  'phone upload page renders from the QR link',
);
const phoneReady = await phone
  .waitForSelector('text=Connected — choose a photo below', { timeout: 20000 })
  .then(() => true)
  .catch(() => false);
ok(phoneReady, 'phone connected to the kiosk peer');
await phone.setInputFiles('#send-photo', 'public/images/ocr-sample.png');
await settle(600);
ok((await phone.getByText('ocr-sample.png').count()) > 0, 'picked photo listed');
await phone.getByRole('button', { name: /SEND TO KIOSK/i }).click();
const phoneSent = await phone
  .waitForSelector('text=Sent! Watch the kiosk screen.', { timeout: 25000 })
  .then(() => true)
  .catch(() => false);
ok(phoneSent, 'phone reports the photo sent');
const recvOverlay = await page
  .waitForSelector('text=Processing document', { timeout: 25000 })
  .then(() => true)
  .catch(() => false);
ok(recvOverlay, 'kiosk opens the processing overlay for the received photo');
await page.getByText('DOCUMENT DIGITIZED').waitFor({ timeout: 90000 });
await settle(2400);
const receivedTextOk = await page
  .waitForFunction(() => document.body.innerText.includes('CONSTITUTION OF INDIA'), null, { timeout: 20000 })
  .then(() => true)
  .catch(() => false);
ok(receivedTextOk, 'kiosk OCR extracted text from the phone-transferred photo');
await page.screenshot({ path: `${SHOT}/17-phone-ocr.png` });
ok(phoneErrors.length === 0, `phone page free of runtime errors (${phoneErrors.join(' | ') || 'none'})`);
await phone.close();

await go('/digitize?auto=1&lang=hi');
ok(
  (await page.getByText(/Processing document|Document detected|Recognizing text|DOCUMENT DIGITIZED/i).count()) >= 1,
  '?auto=1 auto-starts the pipeline',
);
await page.waitForSelector('text=DOCUMENT DIGITIZED', { timeout: 90000 });
ok(
  (await page.getByRole('radio', { name: 'हिन्दी', exact: true }).getAttribute('aria-checked')) === 'true',
  '?lang=hi preselects the Hindi translation',
);
await page.screenshot({ path: `${SHOT}/16-digitize.png` });

/* ----------------------------- 10. RESPONSIVE ----------------------------- */
console.log('\n[RESPONSIVE]');
const mobile = await ctx.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto(`${BASE}/kiosk`, { waitUntil: 'load' });
await mobile.waitForTimeout(1200);
await mobile.screenshot({ path: `${SHOT}/05-kiosk-mobile.png` });
await mobile.getByRole('button', { name: 'Open menu' }).click();
await mobile.waitForTimeout(500);
ok((await mobile.getByRole('navigation', { name: 'Mobile' }).count()) === 1, 'mobile menu opens');
await mobile.screenshot({ path: `${SHOT}/06-kiosk-mobile-menu.png` });
await mobile.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Explore Archive' }).click();
await mobile.waitForTimeout(1000);
ok(mobile.url().includes('/archive'), 'mobile menu link navigates');
await mobile.screenshot({ path: `${SHOT}/07-archive-mobile.png` });
await mobile.goto(`${BASE}/timeline`, { waitUntil: 'load' });
await mobile.waitForTimeout(1200);
await mobile.screenshot({ path: `${SHOT}/08-timeline-mobile.png`, fullPage: false });
await mobile.close();

const tablet = await ctx.newPage();
await tablet.setViewportSize({ width: 1024, height: 768 });
await tablet.goto(`${BASE}/document/sp-002`, { waitUntil: 'load' });
await tablet.waitForTimeout(1200);
await tablet.screenshot({ path: `${SHOT}/09-document-tablet.png` });
await tablet.close();

/* -------------------------------- REPORT --------------------------------- */
console.log('\n[BROWSER ERRORS]');
if (runtimeErrors.length === 0) console.log('  none');
else runtimeErrors.forEach((e) => console.log(`  ${e}`));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (problems.length) console.log('FAILED:\n - ' + problems.join('\n - '));

await browser.close();
process.exit(fail > 0 ? 1 : 0);
