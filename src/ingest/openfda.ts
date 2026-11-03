import type { Item } from '@/lib/types';
import { readFixture, sourceMode } from './fixtures';

interface Enforcement {
  recall_number: string;
  product_description: string;
  reason_for_recall: string;
  recalling_firm: string;
  classification: string;
  distribution_pattern: string;
  report_date: string;
  code_info?: string;
}

const iso = (ymd: string) => `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;

export function normalizeOpenFda(results: Enforcement[]): Item[] {
  return results.map((r) => {
    const count = r.product_description.split(';').length;
    const summary = count > 1 ? `${count} products, ${r.reason_for_recall.toLowerCase()}` : r.product_description.slice(0, 90);
    return {
    id: `openfda:${r.recall_number}`,
    source: 'openfda' as const,
    title: `${r.recalling_firm}: ${summary}`,
    url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
    publishedAt: iso(r.report_date),
    rawText: [
      `Classification: ${r.classification}`,
      `Firm: ${r.recalling_firm}`,
      `Product: ${r.product_description}`,
      `Reason: ${r.reason_for_recall}`,
      `Distribution: ${r.distribution_pattern}`,
      r.code_info ? `Codes: ${r.code_info}` : '',
    ].filter(Boolean).join('\n'),
    };
  });
}

export async function fetchOpenFda(): Promise<Item[]> {
  if (sourceMode() === 'fixture') return normalizeOpenFda(JSON.parse(readFixture('openfda.json')).results);
  const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86_400_000);
  const url = `https://api.fda.gov/food/enforcement.json?search=report_date:[${ymd(from)}+TO+${ymd(to)}]&limit=100`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (res.status === 404) return []; // openFDA answers 404 when a date window has no matches.
  if (!res.ok) throw new Error(`openFDA returned ${res.status}`);
  return normalizeOpenFda((await res.json()).results);
}
