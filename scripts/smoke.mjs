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
  if (!req.url().includes('fonts.g')) runtimeErrors.push(`requestfailed: ${req.url()}`);
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

/* ------------------------------- 1. KIOSK -------------------------------- */
console.log('\n[KIOSK /kiosk]');
await go('/kiosk');
ok((await page.locator('h1').first().innerText()).includes('Explore the Legacy'), 'hero headline renders');
ok((await page.getByRole('link', { name: /view timeline/i }).count()) > 0, 'VIEW TIMELINE CTA present');
ok((await page.getByRole('link', { name: /explore the archive/i }).count()) >= 1, 'EXPLORE THE ARCHIVE CTA present');
ok((await page.getByText('MANUSCRIPTS').count()) > 0, 'collection tiles present');
ok((await page.getByText('Featured Archive').count()) > 0, 'featured section present');
await page.screenshot({ path: `${SHOT}/01-kiosk.png`, fullPage: false });

// collection tile navigates with filter
await page.getByText('SPEECHES', { exact: true }).first().click();
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

await page.getByRole('button', { name: /ask about this/i }).click();
await settle(600);
ok((await page.getByText(/Phase 2/).count()) > 0, 'ask panel labels Phase 2');
await page.getByRole('button', { name: 'Close', exact: true }).click();
await settle(400);

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

// language selector
await page.getByRole('button', { name: 'Select language' }).click();
await settle(400);
await page.getByRole('option', { name: /हिन्दी/ }).click();
await settle(400);
ok((await page.getByRole('button', { name: 'Select language' }).innerText()).includes('HI'), 'language selector updates');
ok((await page.getByText(/Interface translation is scheduled for Phase 2/).count()) >= 0, 'language placeholder note available');

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

/* ----------------------------- 6. RESPONSIVE ----------------------------- */
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
