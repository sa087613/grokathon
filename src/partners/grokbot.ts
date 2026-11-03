import { getDb } from '@/lib/db';
import { getProfile, getView } from '@/lib/store';
import type { ItemView, StoreProfile } from '@/lib/types';

export const STEPS = ['drafted', 'sent', 'awaiting_approval', 'done'] as const;
export type Step = (typeof STEPS)[number];
export const STEP_LABELS: Record<Step, string> = { drafted: 'Drafted', sent: 'Sent to bot', awaiting_approval: 'Awaiting approval', done: 'Done' };

export type PartnerMode = 'simulated' | 'manual';
export const partnerMode = (): PartnerMode => (process.env.PARTNER_MODE === 'manual' ? 'manual' : 'simulated');

export function taskPacket(v: ItemView, p: StoreProfile | null): string {
  const d = v.decision;
  return [
    'TASK FOR GROK BOT',
    `Business: ${p?.businessName ?? 'Unknown'}`,
    `Item: ${v.title}`,
    `Why it matters: ${d.reason}`,
    d.suggestedAction ? `Requested action: ${d.suggestedAction}` : '',
    d.deadline ? `Deadline: ${d.deadline}` : '',
    `Source: ${v.url}`,
    'Do not take any outside action until the owner approves.',
  ].filter(Boolean).join('\n');
}

export interface RunState {
  mode: PartnerMode;
  status: Step | null;
  packet: string;
}

const statusOf = (itemId: string) =>
  (getDb().prepare("SELECT status FROM partner_runs WHERE item_id = ? AND partner = 'grokbot'").get(itemId) as { status: Step } | undefined)?.status ?? null;

const setStatus = (itemId: string, status: Step) => {
  getDb().prepare("UPDATE partner_runs SET status = ? WHERE item_id = ? AND partner = 'grokbot'").run(status, itemId);
};

export function runState(itemId: string): RunState | null {
  const v = getView(itemId);
  return v ? { mode: partnerMode(), status: statusOf(itemId), packet: taskPacket(v, getProfile()) } : null;
}

export type PartnerOp = { op: 'start' } | { op: 'advance' } | { op: 'approve' } | { op: 'set'; status: Step };

/** Returns an error message, or null. Simulated runs can't pass the approval gate without approve. */
export function applyOp(itemId: string, body: PartnerOp): string | null {
  const status = statusOf(itemId);
  if (body.op === 'start') {
    if (!status) {
      getDb().prepare('INSERT INTO partner_runs (id, item_id, partner, status, payload, created_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(`grokbot:${itemId}`, itemId, 'grokbot', 'drafted', runState(itemId)!.packet, new Date().toISOString());
    }
    return null;
  }
  if (!status) return 'No run yet';
  if (body.op === 'advance') {
    if (partnerMode() !== 'simulated') return 'Simulated runs only';
    if (status === 'drafted') setStatus(itemId, 'sent');
    else if (status === 'sent') setStatus(itemId, 'awaiting_approval');
    return null;
  }
  if (body.op === 'approve') {
    if (status !== 'awaiting_approval') return 'Nothing is awaiting approval';
    setStatus(itemId, 'done');
    return null;
  }
  if (partnerMode() !== 'manual') return 'Manual mode only';
  if (!STEPS.includes(body.status)) return 'Unknown status';
  setStatus(itemId, body.status);
  return null;
}
