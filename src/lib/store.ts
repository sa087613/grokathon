import { classify } from './classify';
import { getDb } from './db';
import type { DecisionKind, DecisionRow, Item, ItemView, OverrideKind, StoreProfile, Topic, TriageResult } from './types';

const nowIso = () => new Date().toISOString();

export function saveItem(item: Item): boolean {
  const { topic, classLabel } = classify(item);
  const res = getDb()
    .prepare(`INSERT OR IGNORE INTO items (id, source, title, url, published_at, raw_text, topic, class_label, fetched_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(item.id, item.source, item.title, item.url, item.publishedAt, item.rawText, topic, classLabel, nowIso());
  return res.changes > 0;
}

export function getProfile(): StoreProfile | null {
  const row = getDb().prepare('SELECT data FROM store_profile WHERE id = 1').get() as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function saveProfile(profile: StoreProfile): void {
  getDb().prepare('INSERT INTO store_profile (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data').run(JSON.stringify(profile));
}

export function saveDecision(itemId: string, input: string, r: TriageResult, stage: 'screen' | 'full', model: string): void {
  getDb()
    .prepare(`INSERT INTO decisions (item_id, input, decision, reason, actionable, deadline, suggested_action, stage, model, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(itemId, input, r.decision, r.reason, r.actionable ? 1 : 0, r.deadline ?? null, r.suggestedAction ?? null, stage, model, nowIso());
}

/** Overwrites any earlier overturn, so an owner can change their mind. */
export function overturn(itemId: string, kind: OverrideKind): boolean {
  return getDb()
    .prepare('UPDATE decisions SET overridden = 1, override_kind = ?, override_at = ? WHERE item_id = ?')
    .run(kind, nowIso(), itemId).changes > 0;
}

export function resolveItem(itemId: string): boolean {
  return getDb().prepare('UPDATE items SET resolved_at = ? WHERE id = ?').run(nowIso(), itemId).changes > 0;
}

export function effectiveDecision(decision: DecisionKind, kind: OverrideKind | null): DecisionKind {
  if (kind === 'didnt_need') return 'REJECT';
  if (kind === 'should_have_surfaced') return 'TO_CHECK';
  return decision;
}

const JOINED = `SELECT i.*, d.id AS d_id, d.input, d.decision, d.reason, d.actionable, d.deadline, d.suggested_action,
  d.stage, d.model, d.created_at AS d_created, d.overridden, d.override_kind
  FROM items i JOIN decisions d ON d.item_id = i.id`;

function toView(r: any): ItemView {
  const decision: DecisionRow = {
    id: r.d_id, itemId: r.id, input: r.input, decision: r.decision, reason: r.reason, actionable: !!r.actionable,
    deadline: r.deadline ?? undefined, suggestedAction: r.suggested_action ?? undefined, stage: r.stage, model: r.model,
    createdAt: r.d_created, overridden: !!r.overridden, overrideKind: r.override_kind,
    effective: effectiveDecision(r.decision, r.override_kind),
  };
  return {
    id: r.id, source: r.source, title: r.title, url: r.url, publishedAt: r.published_at, rawText: r.raw_text,
    topic: r.topic, classLabel: r.class_label, resolvedAt: r.resolved_at, decision,
    partnerRuns: null,
  };
}

export function allViews(): ItemView[] {
  return (getDb().prepare(`${JOINED} ORDER BY i.published_at DESC, i.id`).all() as any[]).map(toView);
}

export function getView(itemId: string): ItemView | null {
  const row = getDb().prepare(`${JOINED} WHERE i.id = ?`).get(itemId);
  return row ? toView(row) : null;
}

export function listByDecision(kind: DecisionKind, topic?: Topic): ItemView[] {
  return allViews().filter((v) => v.decision.effective === kind && !v.resolvedAt && (!topic || v.topic === topic));
}

export function listRejected(): ItemView[] {
  return allViews().filter((v) => v.decision.effective === 'REJECT');
}

export function searchItems(query: string, limit = 8): ItemView[] {
  const terms = query.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 2) ?? [];
  const scored = allViews()
    .map((v) => {
      const hay = `${v.title} ${v.rawText} ${v.decision.reason}`.toLowerCase();
      return { v, score: terms.filter((t) => hay.includes(t)).length };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.v);
}

export interface RunRow {
  startedAt: string;
  finishedAt: string | null;
  itemsRead: number;
  itemsSurfaced: number;
  failures: string[];
}

export function latestRun(): RunRow | null {
  const r = getDb().prepare('SELECT * FROM runs ORDER BY id DESC LIMIT 1').get() as any;
  return r ? { startedAt: r.started_at, finishedAt: r.finished_at, itemsRead: r.items_read, itemsSurfaced: r.items_surfaced, failures: JSON.parse(r.failures) } : null;
}

export function recordRun(startedAt: string, itemsRead: number, itemsSurfaced: number, failures: string[]): void {
  getDb().prepare('INSERT INTO runs (started_at, finished_at, items_read, items_surfaced, failures) VALUES (?, ?, ?, ?, ?)')
    .run(startedAt, nowIso(), itemsRead, itemsSurfaced, JSON.stringify(failures));
}
