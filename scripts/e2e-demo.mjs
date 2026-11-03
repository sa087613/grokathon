// Clicks the path in docs/DEMO.md against production. Any step or console error fails it.
import { chromium } from 'playwright';
import { BASE, withServer } from './server.mjs';

await withServer(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const problems = [];
  const tiles = /tile\.openstreetmap|ERR_(NAME|INTERNET)/;
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type()) && !tiles.test(m.text() + m.location().url)) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const card = (title) => page.locator('article', { hasText: title });
  const step = async (name, fn) => { await fn(); console.log(`ok ${name}`); };

  await step('Overview', async () => {
    await page.goto(BASE);
    await page.getByRole('heading', { name: /your signature/ }).waitFor();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'docs/screenshots/overview.png' });
  });
  await step('Needs action card', async () => {
    await card('Sunbelt Produce Co').getByText('Show the products').click();
    await page.getByText('Pico base mix').waitFor();
  });
  await step('Rejected', async () => {
    await page.getByRole('button', { name: 'The record' }).click();
    await page.getByRole('menuitem', { name: /Rejected log/ }).click();
    await page.getByRole('heading', { name: 'What I left out' }).waitFor();
    await card('26-R-3380').waitFor();
    await page.screenshot({ path: 'docs/screenshots/rejected.png' });
    await page.goto(BASE);
  });
  await step('Document analysis card', async () => {
    const c = card('26-O-1412');
    await c.getByText('Show details').click();
    await c.getByText('re-register', { exact: false }).waitFor();
  });
  await step('Feedback card', async () => {
    await page.getByRole('link', { name: /To check/ }).click();
    await card('phase two').getByText('You asked to see a similar item').waitFor();
    await page.getByRole('link', { name: /Needs action/ }).click();
    await card('Sunbelt Produce Co').waitFor();
  });
  await step('Chat chip', async () => {
    await page.getByRole('button', { name: 'Ask the radar' }).click();
    const chat = page.getByRole('region', { name: 'Ask the radar' });
    await chat.getByRole('button', { name: 'What do I need to do today?' }).click();
    await chat.getByText('found.', { exact: false }).waitFor();
    await chat.getByRole('button', { name: 'Close' }).click();
  });
  await step('Share via email', async () => {
    const href = await card('Sunbelt Produce Co').getByRole('link', { name: 'Share via email' }).getAttribute('href');
    if (!href?.startsWith('mailto:') || !href.includes('body=')) throw new Error('Bad mailto');
  });
  await step('Hand to Grok Bot', async () => {
    await card('Sunbelt Produce Co').getByRole('button', { name: 'Hand to Grok Bot' }).click();
    const drawer = page.getByRole('complementary', { name: 'Grok Bot handoff' });
    await drawer.getByText('Simulated', { exact: true }).waitFor();
    await drawer.getByRole('button', { name: 'Approve' }).waitFor();
    await page.screenshot({ path: 'docs/screenshots/grokbot.png' });
  });
  await step('Approve', async () => {
    const drawer = page.getByRole('complementary', { name: 'Grok Bot handoff' });
    await drawer.getByRole('button', { name: 'Approve' }).click();
    await drawer.getByRole('button', { name: 'Approve' }).waitFor({ state: 'detached' });
  });
  for (const p of ['/profile', '/about', '/ask']) { await page.goto(BASE + p); await page.waitForTimeout(400); }
  await browser.close();
  if (problems.length) throw new Error(`Console problems:\n${problems.join('\n')}`);
  console.log('Demo path passed.');
}).catch((e) => { console.error(e.message); process.exit(1); });
