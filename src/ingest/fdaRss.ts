import { XMLParser } from 'fast-xml-parser';
import { createHash } from 'node:crypto';
import type { Item } from '@/lib/types';
import { fetchText, readFixture, sourceMode } from './fixtures';

const FEED = 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml';
const NON_FOOD = /\b(tablets?|capsules?|injection|ophthalmic|syringe|catheter|medical device|cosmetic)\b/i;

export function parseFdaRss(xml: string): Item[] {
  const feed = new XMLParser({ ignoreAttributes: true }).parse(xml);
  const raw = feed?.rss?.channel?.item ?? [];
  const entries: any[] = Array.isArray(raw) ? raw : [raw];
  return entries
    .filter((e) => !NON_FOOD.test(`${e.title} ${e.description ?? ''}`))
    .map((e) => {
      const link = String(e.link ?? FEED);
      return {
        id: `fda-rss:${createHash('sha1').update(link + e.title).digest('hex').slice(0, 12)}`,
        source: 'fda-rss' as const,
        title: String(e.title),
        url: link,
        publishedAt: new Date(e.pubDate ?? Date.now()).toISOString().slice(0, 10),
        rawText: String(e.description ?? e.title).replace(/<[^>]+>/g, ' ').trim(),
      };
    });
}

export async function fetchFdaRss(): Promise<Item[]> {
  return parseFdaRss(sourceMode() === 'fixture' ? readFixture('fda-rss.xml') : await fetchText(FEED));
}
