// Layout matrix: every primary route × every reference viewport.
// Guards the grid-overflow class of bugs fixed in Phase 1.
// Usage: start the dev server first, then `node ./scripts/layout.mjs`.
import { chromium } from 'playwright-core';

const EXE = process.env.CHROME_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';

const ROUTES = ['/kiosk', '/archive', '/document/ms-001', '/timeline', '/scan', '/ocr'];
const VIEWPORTS = [
  { name: 'desktop-wide', width: 1920, height: 1080 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
];

let pass = 0;
let fail = 0;
const problems = [];

const ok = (cond, label) => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    problems.push(label);
    console.log(`  FAIL  ${label}`);
  }
};

const browser = await chromium.launch({ executablePath: EXE, headless: true });

for (const viewport of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await ctx.newPage();
  const runtimeErrors = [];
  page.on('pageerror', (err) => runtimeErrors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`);
  });

  console.log(`\n[${viewport.name} ${viewport.width}×${viewport.height}]`);

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'load', timeout: 25000 });
    await page.evaluate(() => document.fonts.ready);
    // scroll the whole page so loading="lazy" images actually request
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const step = Math.max(320, Math.round(window.innerHeight * 0.8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await sleep(140);
      }
      window.scrollTo(0, document.documentElement.scrollHeight);
      await sleep(700);
      window.scrollTo(0, 0);
      await sleep(200);
    });
    await page
      .waitForFunction(() => [...document.images].every((img) => img.complete), { timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(400);

    const report = await page.evaluate(() => {
      const images = [...document.images];
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        images: images.length,
        brokenImages: images
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute('src')),
        overflowers: [...document.querySelectorAll('main *')]
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.right > window.innerWidth + 2;
          })
          .slice(0, 4)
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]}`),
      };
    });

    const noOverflow =
      report.scrollWidth <= report.innerWidth + 1 && report.bodyScrollWidth <= report.innerWidth + 1;
    ok(noOverflow, `${route} · no horizontal overflow (${report.scrollWidth}/${report.innerWidth})`);
    ok(
      report.brokenImages.length === 0,
      `${route} · images loaded (${report.images} found${
        report.brokenImages.length ? `, broken: ${report.brokenImages.join(', ')}` : ''
      })`,
    );
    if (!noOverflow && report.overflowers.length) {
      console.log(`        overflowing: ${report.overflowers.join(', ')}`);
    }
  }

  ok(runtimeErrors.length === 0, `no console/runtime errors (${runtimeErrors.join(' | ') || 'none'})`);
  await ctx.close();
}

await browser.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (problems.length) console.log('FAILED:\n - ' + problems.join('\n - '));
process.exit(fail ? 1 : 0);
