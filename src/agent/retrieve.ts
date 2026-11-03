import { getDb } from '@/lib/db';
import { cosine } from '@/lib/embed';
import { embed } from '@/lib/llm';
import { getView } from '@/lib/store';
import type { ItemView } from '@/lib/types';

export interface Example {
  view: ItemView;
  similarity: number;
}

export const embedText = (v: { title: string; rawText: string }) => `${v.title}\n${v.rawText.slice(0, 1500)}`;

export function storeEmbedding(itemId: string, model: string, vector: number[]): void {
  getDb()
    .prepare('INSERT INTO embeddings (item_id, model, vector) VALUES (?, ?, ?) ON CONFLICT(item_id) DO UPDATE SET model = excluded.model, vector = excluded.vector')
    .run(itemId, model, JSON.stringify(vector));
}

/** Re-embeds older rows after an embedding model change, e.g. when a key is added. */
export async function refreshEmbeddings(model: string): Promise<void> {
  const stale = getDb()
    .prepare('SELECT i.id, i.title, i.raw_text AS rawText FROM embeddings e JOIN items i ON i.id = e.item_id WHERE e.model != ?')
    .all(model) as { id: string; title: string; rawText: string }[];
  for (const row of stale) {
    const e = await embed(embedText(row));
    storeEmbedding(row.id, e.model, e.vector);
  }
}

/** The k most similar past decisions, overturned ones included. */
export function similarDecisions(vector: number[], model: string, excludeId: string, k = 5): Example[] {
  const rows = getDb()
    .prepare('SELECT e.item_id, e.vector FROM embeddings e JOIN decisions d ON d.item_id = e.item_id WHERE e.model = ? AND e.item_id != ?')
    .all(model, excludeId) as { item_id: string; vector: string }[];
  return rows
    .map((r) => ({ id: r.item_id, similarity: cosine(vector, JSON.parse(r.vector)) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
    .map((r) => ({ view: getView(r.id)!, similarity: r.similarity }));
}
