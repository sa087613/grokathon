import { describe, expect, it } from 'vitest';
import { fetchAll, FETCHERS } from '@/ingest';
import { parseAgendaHtml } from '@/ingest/council';
import { resolveDates } from '@/ingest/fixtures';
import { parseFdaRss } from '@/ingest/fdaRss';
import { classify } from '@/lib/classify';
import { item } from './helpers';

describe('ingest', () => {
  it('normalizes about 60 fixture items from all sources', async () => {
    const { items, failures } = await fetchAll();
    expect(failures).toEqual([]);
    expect(items).toHaveLength(60);
    expect(new Set(items.map((i) => i.id)).size).toBe(60);
    expect(new Set(items.map((i) => i.source)).size).toBe(5);
    for (const i of items) expect(i.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('reports a failed source instead of hiding it', async () => {
    const original = FETCHERS[0].fetch;
    FETCHERS[0].fetch = async () => { throw new Error('down'); };
    const { failures } = await fetchAll();
    FETCHERS[0].fetch = original;
    expect(failures).toEqual(['openFDA enforcement']);
  });

  it('reads staff report text out of fixture PDFs', async () => {
    const { items } = await fetchAll();
    const doc = items.find((i) => i.title.includes('26-O-1412'))!;
    expect(doc.rawText).toContain('re-register');
    expect(doc.rawText).not.toContain('{{');
  });

  it('resolves relative fixture dates', () => {
    expect(resolveDates('{{iso-1}} {{long+1}}', new Date(2026, 0, 31))).toBe('2026-01-30 February 1, 2026');
  });

  it('parses agenda links without a fixed layout', () => {
    const rows = parseAgendaHtml('<tr><td><a href="/a.pdf">Staff doc</a></td></tr><a href="/home">Home</a>');
    expect(rows.map((r) => r.title)).toEqual(['Staff doc']);
  });

  it('drops non-food RSS entries', () => {
    const xml = '<rss><channel><item><title>Acme tablets recall</title><link>u</link></item></channel></rss>';
    expect(parseFdaRss(xml)).toEqual([]);
  });

  it('keeps street vending out of street work', () => {
    expect(classify(item({ title: 'Street vending permit' })).topic).toBe('permits_fees');
    expect(classify(item({ title: 'Howell Mill lane closure' })).topic).toBe('street_work');
  });
});
