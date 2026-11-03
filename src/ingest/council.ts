import * as cheerio from 'cheerio';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import type { Item } from '@/lib/types';
import { USER_AGENT, fetchText, fixturePath, readFixture, resolveDates, sourceMode } from './fixtures';
import { pdfText } from './pdf';

const BASE = 'https://citycouncil.atlantaga.gov/';
const COMMITTEES = ['city-utilities', 'committee-on-council', 'community-development-human-services', 'finance-executive-committee', 'public-safety-committee', 'transportation-committee', 'zoning-committee'];
const AGENDA_PAGES = COMMITTEES.map((c) => `${BASE}standing-committees/${c}/agenda`);
const LEGISLATION_NUMBER = /\b\d{2}-[OR]-\d+/i;

export interface AgendaEntry {
  title: string;
  href: string;
  context: string;
  date: string | null;
}

/** Works off links rather than a fixed layout, because the Granicus markup is not a stable API. */
export function parseAgendaHtml(html: string): AgendaEntry[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const entries: AgendaEntry[] = [];
  $('a[href]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href')!;
    const title = a.text().replace(/\s+/g, ' ').trim();
    if (!title || seen.has(href + title)) return;
    // Site navigation also says Legislation and Agenda, so only real documents count.
    if (!LEGISLATION_NUMBER.test(title) && !/\.pdf($|\?)/i.test(href)) return;
    seen.add(href + title);
    const row = a.closest('li, tr, article');
    entries.push({
      title,
      href,
      context: (row.length ? row.text() : title).replace(/\s+/g, ' ').trim(),
      date: row.find('time[datetime]').attr('datetime') ?? null,
    });
  });
  return entries;
}

async function pdfBody(href: string): Promise<string> {
  if (href.startsWith('fixture:')) {
    return resolveDates(await pdfText(fs.readFileSync(fixturePath(`council/${href.slice(8)}`))));
  }
  const res = await fetch(new URL(href, BASE), { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) return '';
  return pdfText(Buffer.from(await res.arrayBuffer()));
}

export async function fetchCouncil(): Promise<Item[]> {
  const isFixture = sourceMode() === 'fixture';
  const pages = isFixture ? [readFixture('council/agenda.html')] : await Promise.all(AGENDA_PAGES.map(fetchText));
  const entries = pages.flatMap(parseAgendaHtml);
  // An empty parse means the site changed, which must not look like a quiet day.
  if (!entries.length) throw new Error('No agenda documents found');
  const items: Item[] = [];
  for (const e of entries.slice(0, 40)) {
    const isPdf = /\.pdf($|\?)/i.test(e.href);
    const fixture = e.href.startsWith('fixture:') || e.href === '#';
    let body = '';
    if (isPdf) body = await pdfBody(e.href).catch(() => '');
    items.push({
      id: `council:${createHash('sha1').update(e.title + (e.href === '#' ? '' : e.href)).digest('hex').slice(0, 12)}`,
      source: 'atlanta-council',
      title: e.title,
      url: fixture ? BASE : new URL(e.href, BASE).toString(),
      publishedAt: e.date ?? new Date().toISOString().slice(0, 10),
      rawText: [e.context, body].filter(Boolean).join('\n\n'),
    });
  }
  return items;
}
