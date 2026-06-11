import { test, expect } from '@playwright/test';

const LINK = '/link/';
const SUBTITLE_COLOR = 'rgb(75, 70, 60)';
const INK = 'rgb(21, 17, 11)';
const GOLD = 'rgb(181, 138, 84)';
const EXPECTED_HREFS = [
  'https://www.juliannesilla.com',
  'https://www.juliannesilla.com',
  'https://juliannesilla.github.io/julz-command-center/resume.pdf',
  'mailto:julianne.mktg@gmail.com',
  'https://www.linkedin.com/in/juliannesilla-m',
  'tel:+16507590995',
  'https://instagram.com/geezjulz',
  'https://tiktok.com/@geezjulz',
  'https://wa.me/16507590995',
  'mailto:julianne.mktg@gmail.com',
];
const BRAND_FONTS = ['Playfair Display', 'Cormorant Garamond'];

let consoleErrors: string[];

test.beforeEach(async ({ page }) => {
  consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  await page.goto(LINK);
});

test('loads with correct title and zero console errors', async ({ page }) => {
  await expect(page).toHaveTitle(/Julianne Silla/);
  await expect(page.locator('.name')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('no horizontal scroll and nameplate never clips', async ({ page }) => {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  const name = page.locator('.name');
  await expect(name).toBeVisible();
  const clip = await name.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(clip).toBeLessThanOrEqual(2);
});

test('subtitle is bold dark gray, non-italic', async ({ page }) => {
  const subtitle = page.locator('.subtitle');
  await expect(subtitle).toBeVisible();
  await expect(subtitle).toHaveCSS('color', SUBTITLE_COLOR);
  await expect(subtitle).toHaveCSS('font-weight', '700');
  await expect(subtitle).toHaveCSS('font-style', 'normal');
});

test('subtitle renders on a single line (desktop)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one-line rule is desktop-only');
  const lines = await page.locator('.subtitle').evaluate((el) => {
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return Math.round(el.getBoundingClientRect().height / lh);
  });
  expect(lines).toBe(1);
});

test('hero uses the right crop and ratio per viewport', async ({ page }, testInfo) => {
  const photo = page.locator('.photo');
  await expect(photo).toBeVisible();
  const info = await photo.evaluate((el) => ({
    ratio: el.clientWidth / el.clientHeight,
    bg: getComputedStyle(el).backgroundImage,
  }));
  if (testInfo.project.name === 'desktop') {
    expect(info.ratio).toBeGreaterThan(1.7);
    expect(info.ratio).toBeLessThan(1.85);
    expect(info.bg).toContain('hero-wide.jpg');
  } else {
    expect(info.ratio).toBeGreaterThan(0.95);
    expect(info.ratio).toBeLessThan(1.05);
    expect(info.bg).toContain('hero-mobile.jpg');
  }
});

test('tagline and hero CTA are locked', async ({ page }) => {
  await expect(page.locator('.tagline')).toContainText('Director-level strategy.');
  await expect(page.locator('.tagline')).toContainText('Creator-speed');
  const cta = page.locator('.cta');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', 'https://www.juliannesilla.com');
});

test('five cards in locked order with correct anatomy', async ({ page }) => {
  const titles = page.locator('.card .t');
  await expect(titles).toHaveText([
    /Marketing Portfolio/i,
    /Pet UGC Portfolio/i,
    /Download Resume/i,
    /Email Me/i,
    /LinkedIn/i,
  ]);
  const resume = page.locator('a.card', { hasText: 'Download Resume' });
  await expect(resume).toHaveAttribute('href', /resume\.pdf$/);
  await expect(resume).not.toHaveClass(/dark/);
  const soonCard = page.locator('.card.soon-card');
  await expect(soonCard).toBeVisible();
  const soonHref = await soonCard.evaluate((el) => el.getAttribute('href'));
  expect(soonHref).toBeNull();
  const soonRects = await page.locator('.soon').evaluate((el) => el.getClientRects().length);
  expect(soonRects).toBe(1);
});

test('descriptors sit on their own line under each title', async ({ page }) => {
  const cards = page.locator('a.card:has(.s)');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const below = await cards.nth(i).evaluate((el) => {
      const t = el.querySelector('.t').getBoundingClientRect();
      const s = el.querySelector('.s').getBoundingClientRect();
      return s.top >= t.bottom - 2;
    });
    expect(below).toBe(true);
  }
});

test('card icons are ink, flipping gold on hover (desktop)', async ({ page }, testInfo) => {
  const firstIcon = page.locator('.card .ic').first();
  await expect(firstIcon).toHaveCSS('color', INK);
  test.skip(testInfo.project.name !== 'desktop', 'hover is desktop-only');
  const firstCard = page.locator('a.card').first();
  await firstCard.hover();
  await expect(firstIcon).toHaveCSS('color', GOLD);
  await expect(firstCard).toHaveCSS('background-color', INK);
});

test('social pills are icon-only with 44px touch targets', async ({ page }) => {
  const pills = page.locator('.pill');
  await expect(pills).toHaveCount(4);
  await expect(page.locator('.pill span')).toHaveCount(0);
  const boxes = await pills.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  for (const b of boxes) {
    expect(b.width).toBeGreaterThanOrEqual(44);
    expect(b.height).toBeGreaterThanOrEqual(44);
  }
});

test('every link href matches the locked spec exactly', async ({ page }) => {
  const hrefs = await page.locator('a[href]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(EXPECTED_HREFS);
});

test('only the two brand fonts render', async ({ page }) => {
  const fonts = await page.evaluate(() =>
    [...new Set(
      Array.from(document.querySelectorAll('h1, p, span, a, div'))
        .slice(0, 300)
        .map((e) => getComputedStyle(e).fontFamily.split(',')[0].replace(/['"]/g, '').trim())
    )]
  );
  const offBrand = fonts.filter((f) => !BRAND_FONTS.includes(f));
  expect(offBrand).toEqual([]);
});

test('footer tagline is the locked copy in bold', async ({ page }) => {
  const tag = page.locator('.foot .tag');
  await expect(tag).toContainText('Strategy That Converts.');
  await expect(tag).toContainText('Stories That Resonate.');
  await expect(tag).toHaveCSS('font-weight', '700');
});

test('review widget stays hidden publicly, appears with the sticky flag', async ({ page }) => {
  await expect(page.locator('.jrv-bar')).toHaveCount(0);
  await page.evaluate(() => localStorage.setItem('julz-review-mode', '1'));
  await page.reload();
  await expect(page.locator('.jrv-bar')).toBeVisible();
});
