import { getDb } from '@/lib/db';
import { embed } from '@/lib/llm';
import { fetchAll } from '@/ingest';
import { getProfile, getView, recordRun, saveItem } from '@/lib/store';
import type { Item } from '@/lib/types';
import { refreshEmbeddings } from './retrieve';
import { triageItem } from './triage';

export function pendingItems(): Item[] {
  const rows = getDb()
    .prepare(`SELECT i.id, i.source, i.title, i.url, i.published_at AS publishedAt, i.raw_text AS rawText
              FROM items i LEFT JOIN decisions d ON d.item_id = i.id WHERE d.id IS NULL ORDER BY i.published_at, i.id`)
    .all() as Item[];
  return rows;
}

/** Triage items in date order, so each one learns from those before it. Provider errors leave an item pending for the next run. */
export async function triagePending(filter: (i: Item) => boolean = () => true): Promise<{ surfaced: number; errors: number }> {
  const profile = getProfile();
  if (!profile) throw new Error('No store profile. Run npm run seed first.');
  let surfaced = 0;
  let errors = 0;
  for (const item of pendingItems().filter(filter)) {
    try {
      if ((await triageItem(item, profile)).decision !== 'REJECT') surfaced++;
    } catch (err) {
      errors++;
      console.error(`Triage failed for ${item.id}:`, (err as Error).message);
    }
  }
  return { surfaced, errors };
}

export async function runRadar(): Promise<{ read: number; surfaced: number; failures: string[] }> {
  const startedAt = new Date().toISOString();
  const { items, failures } = await fetchAll();
  items.forEach(saveItem);
  await refreshEmbeddings((await embed('probe')).model);
  const { errors } = await triagePending();
  // Counts everything the owner should see from today's read, not only what is new since the last run.
  const surfaced = items.filter((i) => {
    const effective = getView(i.id)?.decision.effective;
    return effective && effective !== 'REJECT';
  }).length;
  if (errors) failures.push(`${errors} items could not be triaged and will retry next run`);
  recordRun(startedAt, items.length, surfaced, failures);
  return { read: items.length, surfaced, failures };
}
