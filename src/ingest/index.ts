import type { Item } from '@/lib/types';
import { fetchCouncil } from './council';
import { fetchFdaRss } from './fdaRss';
import { fetchOpenFda } from './openfda';
import { fetchPageWatch } from './pageWatch';

export const FETCHERS: { name: string; fetch: () => Promise<Item[]> }[] = [
  { name: 'openFDA enforcement', fetch: fetchOpenFda },
  { name: 'FDA recall RSS', fetch: fetchFdaRss },
  { name: 'Atlanta City Council', fetch: fetchCouncil },
  { name: 'City and county page watch', fetch: fetchPageWatch },
];

/** A failed source is reported, never replaced with demo data: silence must not read as all clear. */
export async function fetchAll(): Promise<{ items: Item[]; failures: string[] }> {
  const results = await Promise.allSettled(FETCHERS.map((f) => f.fetch()));
  const items: Item[] = [];
  const failures: string[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') items.push(...r.value);
    else failures.push(FETCHERS[i].name);
  });
  return { items, failures };
}
