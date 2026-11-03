import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import { getDb } from '@/lib/db';
import type { Item, Source } from '@/lib/types';
import { fetchText, readFixture, sourceMode } from './fixtures';

export interface WatchedPage {
  url: string;
  source: Source;
  name: string;
}

export const WATCHED: WatchedPage[] = [
  { url: 'https://www.atlantaga.gov/government/departments/city-planning', source: 'atlanta-notices', name: 'Atlanta vending and special permits' },
  { url: 'https://www.atlantaga.gov/government/departments/department-of-transportation', source: 'atlanta-notices', name: 'Atlanta DOT street work notices' },
  { url: 'https://fultoncountyboh.com/environmental-health/', source: 'county-health', name: 'Fulton County Board of Health' },
  { url: 'https://fultoncountyboh.com/environmental-health/food-service/restaurant-inspection-resources/', source: 'county-health', name: 'Fulton County food service' },
  { url: 'https://dekalbpublichealth.com/', source: 'county-health', name: 'DeKalb County Board of Health' },
];

export function pageText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, nav, footer, header').remove();
  return ($('main').text() || $('body').text()).replace(/\s+/g, ' ').trim();
}

/** Emits an item only when a watched page changes. The first sighting just records a baseline. */
export function detectChange(url: string, text: string): boolean {
  const db = getDb();
  const hash = createHash('sha256').update(text).digest('hex');
  const prev = db.prepare('SELECT hash FROM page_hashes WHERE url = ?').get(url) as { hash: string } | undefined;
  db.prepare('INSERT INTO page_hashes (url, hash) VALUES (?, ?) ON CONFLICT(url) DO UPDATE SET hash = excluded.hash').run(url, hash);
  return !!prev && prev.hash !== hash;
}

export async function watchPage(page: WatchedPage): Promise<Item[]> {
  if (sourceMode() === 'fixture') return page === WATCHED[0] ? (JSON.parse(readFixture('pages/notices.json')) as Item[]) : [];
  const today = new Date().toISOString().slice(0, 10);
  const text = pageText(await fetchText(page.url));
  if (!detectChange(page.url, text)) return [];
  return [{
    id: `page:${createHash('sha1').update(page.url + today).digest('hex').slice(0, 12)}`,
    source: page.source,
    title: `${page.name} page changed`,
    url: page.url,
    publishedAt: today,
    rawText: text.slice(0, 20_000),
  }];
}
