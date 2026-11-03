// Needs the dev server running: node scripts/screenshots.mjs
import { chromium } from 'playwright';

const PAGES = { overview: '/', profile: '/profile', about: '/about', rejected: '/rejected' };
const browser = await chromium.launch();
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of Object.entries(PAGES)) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.log(`${name}@${width} overflows by ${overflow}px`);
    await page.screenshot({ path: `docs/screenshots/${name}-${width}.png`, fullPage: name !== 'overview' || width === 1440 });
  }
  await page.close();
}
await browser.close();
