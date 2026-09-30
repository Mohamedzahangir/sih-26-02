// Accessibility / keyboard QA for the Ambedkar Heritage Hub prototype.
// Usage: start the dev server first, then `npm run a11y`.
import { chromium } from 'playwright-core';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const errors = [];
let pass = 0;
let fail = 0;

const ok = (cond, label) => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    errors.push(label);
    console.log(`  FAIL  ${label}`);
  }
};

const EXE = process.env.CHROME_EXE || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: EXE, headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

console.log('[LANDMARKS + HEADINGS]');
const ROUTES = ['/kiosk', '/archive', '/ask', '/document/ms-001', '/timeline', '/scan', '/ocr', '/digitize', '/missing-page'];
for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });

  const landmarks = await page.evaluate(() => ({
    nav: document.querySelectorAll('nav').length,
    main: document.querySelectorAll('main').length,
    footer: document.querySelectorAll('footer').length,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1])),
    imgNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
    labelledButtons: [...document.querySelectorAll('button')].filter(
      (b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby')
    ).length,
  }));

  ok(landmarks.nav >= 1, `${route} · nav landmark present (${landmarks.nav})`);
  ok(landmarks.main === 1, `${route} · exactly one main landmark (${landmarks.main})`);
  ok(landmarks.footer === 1, `${route} · footer landmark present (${landmarks.footer})`);
  ok(landmarks.h1.length === 1, `${route} · single h1 (${JSON.stringify(landmarks.h1)})`);
  ok(landmarks.imgNoAlt === 0, `${route} · every image has an alt attribute (${landmarks.imgNoAlt} missing)`);
  ok(landmarks.labelledButtons === 0, `${route} · every button has a label (${landmarks.labelledButtons} unlabelled)`);
  ok(
    landmarks.headings.every((h, i) => i === 0 || h <= landmarks.headings[i - 1] + 1),
    `${route} · heading levels do not skip (${landmarks.headings.join('>')})`,
  );
}

console.log('\n[KEYBOARD]');
await page.goto(`${BASE}/document/ms-001`, { waitUntil: 'networkidle' });
const focusOrder = [];
for (let i = 0; i < 8; i++) {
  await page.keyboard.press('Tab');
  focusOrder.push(
    await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return 'BODY';
      const style = getComputedStyle(el);
      return `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} outline=${style.outlineStyle}/${style.outlineWidth} shadow=${style.boxShadow !== 'none'}`;
    })
  );
}
ok(focusOrder[0] !== 'BODY', `first Tab moves focus (${focusOrder[0]})`);
ok(focusOrder.every((f) => f !== 'BODY'), 'focus never returns to body while tabbing');
const visibleFocus = focusOrder.filter((f) => f.includes('outline=solid') || f.includes('shadow=')).length;
ok(visibleFocus >= 6, `visible focus indicator on tabbable elements (${visibleFocus}/8)`);

// The Phase 3 navbar adds Ask / digitize / demo stops, so tab onward until the
// fullscreen viewer control is focused, then activate it with Enter.
let reachedFullscreen = false;
for (let i = 0; i < 16 && !reachedFullscreen; i++) {
  reachedFullscreen = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el.tagName !== 'BUTTON') return false;
    const label = `${el.getAttribute('aria-label') || ''} ${el.textContent || ''}`.toLowerCase();
    return label.includes('fullscreen');
  });
  if (!reachedFullscreen) await page.keyboard.press('Tab');
}
ok(reachedFullscreen, 'tabbing reaches the fullscreen viewer control');
await page.keyboard.press('Enter');
await page.waitForTimeout(900);
const modalOpen = await page.locator('[role="dialog"]').count();
ok(modalOpen >= 1, `Enter activates a focusable control (dialog opened: ${modalOpen})`);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
ok((await page.locator('[role="dialog"]').count()) === 0, 'Escape closes the dialog');

await page.goto(`${BASE}/archive`, { waitUntil: 'networkidle' });
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
const urlBefore = page.url();
await page.keyboard.press('Enter');
await page.waitForTimeout(600);
ok(page.url() !== urlBefore, `keyboard Enter navigates (${page.url()})`);

console.log('\n[LANGUAGE + SCRIPT FONTS]');
const langButton = page.locator('button[aria-haspopup="listbox"]');
const pickLanguage = async (optionName) => {
  await langButton.click();
  await page.waitForTimeout(400);
  await page.getByRole('option', { name: optionName }).click();
  await page.waitForTimeout(800);
};
// webfonts load asynchronously after the script text swaps — poll until ready
const fontLoaded = async (family, sample, timeout = 6000) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    const ready = await page.evaluate(
      ([f, s]) => document.fonts.check(`16px "${f}"`, s),
      [family, sample],
    );
    if (ready) return true;
    if (Date.now() > deadline) return false;
    await page.waitForTimeout(250);
  }
};

await page.goto(`${BASE}/archive`, { waitUntil: 'networkidle' });
await pickLanguage(/हिन्दी/);
const hindi = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  glyphs: (document.body.innerText.match(/[\u0900-\u097F]/g) || []).length,
  fontSans: getComputedStyle(document.body).fontFamily,
  loaded: document.fonts.check('16px "Noto Sans Devanagari"', 'नमस्ते विरासत'),
}));
ok(hindi.lang === 'hi', `html lang switches to hi (${hindi.lang})`);
ok(hindi.glyphs > 50, `Devanagari UI text rendered (${hindi.glyphs} glyphs)`);
ok(hindi.fontSans.includes('Noto Sans Devanagari'), `Noto Sans Devanagari applied (${hindi.fontSans.split(',')[0]})`);
ok(await fontLoaded('Noto Sans Devanagari', 'नमस्ते विरासत'), 'Noto Sans Devanagari webfont loaded');

await pickLanguage(/தமிழ்/);
const tamil = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  glyphs: (document.body.innerText.match(/[\u0B80-\u0BFF]/g) || []).length,
  fontSans: getComputedStyle(document.body).fontFamily,
  loaded: document.fonts.check('16px "Noto Sans Tamil"', 'தமிழ் பாரம்பரியம்'),
}));
ok(tamil.lang === 'ta', `html lang switches to ta (${tamil.lang})`);
ok(tamil.glyphs > 50, `Tamil UI text rendered (${tamil.glyphs} glyphs)`);
ok(tamil.fontSans.includes('Noto Sans Tamil'), `Noto Sans Tamil applied (${tamil.fontSans.split(',')[0]})`);
ok(await fontLoaded('Noto Sans Tamil', 'தமிழ் பாரம்பரியம்'), 'Noto Sans Tamil webfont loaded');

await pickLanguage(/English/);
ok(
  (await page.evaluate(() => document.documentElement.lang)) === 'en',
  'language restored to English',
);

console.log('\n[REDUCED MOTION]');
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(`${BASE}/timeline`, { waitUntil: 'networkidle' });
const motionOk = await page.evaluate(() => {
  const els = [...document.querySelectorAll('*')];
  return els.every((el) => getComputedStyle(el).animationDuration !== 'infinite');
});
ok(motionOk, 'no infinite animations under prefers-reduced-motion');
await page.emulateMedia({ reducedMotion: 'no-preference' });

console.log('\n[CONTRAST SPOT CHECK]');
await page.goto(`${BASE}/kiosk`, { waitUntil: 'networkidle' });
const contrast = await page.evaluate(() => {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (s) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = getComputedStyle(node).backgroundColor;
      const a = bg.match(/(\d+(?:\.\d+)?)\)$/);
      if (bg && !bg.includes('rgba(0, 0, 0, 0)') && (!a || Number(a[1]) > 0.5)) return parse(bg);
      node = node.parentElement;
    }
    return [11, 15, 20];
  };
  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const samples = [...document.querySelectorAll('p, h1, h2, h3, a, button, span')]
    .filter((el) => (el.textContent || '').trim().length > 12 && el.offsetParent !== null)
    .slice(0, 60);
  return samples.map((el) => {
    const cs = getComputedStyle(el);
    return {
      text: (el.textContent || '').trim().slice(0, 30),
      size: parseFloat(cs.fontSize),
      ratio: Math.round(ratio(parse(cs.color), bgOf(el)) * 100) / 100,
      weight: cs.fontWeight,
    };
  });
});
const small = contrast.filter((c) => c.ratio < 4.5 && !(c.size >= 24 || (c.size >= 18.66 && Number(c.weight) >= 700)));
ok(small.length === 0, `text contrast >= 4.5:1 (${contrast.length} sampled)`);
if (small.length) small.forEach((s) => console.log(`        low: ${s.ratio} ${s.size}px "${s.text}"`));

console.log('\n[ERRORS]');
ok(consoleErrors.length === 0, `no console errors (${consoleErrors.join(' | ') || 'none'})`);

await browser.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
