import { overturn, resolveItem } from '@/lib/store';
import type { ItemView } from '@/lib/types';
import { mailtoHref } from './brief';

export interface ItemAction {
  id: string;
  label: string;
  appliesTo: (v: ItemView) => boolean;
  /** Server side effect, run by POST /api/items/[id]/actions/[action]. */
  run?: (v: ItemView) => void;
  /** Plain link instead of a server call. */
  href?: (v: ItemView) => string;
}

/** Serializable form handed to the client. */
export interface ActionButton {
  id: string;
  label: string;
  href?: string;
}

const surfaced = (v: ItemView) => v.decision.effective !== 'REJECT';

/** Add one entry here to add a button to every item card. */
export const ACTIONS: ItemAction[] = [
  { id: 'resolve', label: 'Resolve', appliesTo: (v) => surfaced(v) && !v.resolvedAt, run: (v) => resolveItem(v.id) },
  { id: 'share', label: 'Share via email', appliesTo: surfaced, href: mailtoHref },
  { id: 'dismiss', label: "Didn't need this", appliesTo: surfaced, run: (v) => overturn(v.id, 'didnt_need') },
  { id: 'surface', label: 'Should have surfaced', appliesTo: (v) => !surfaced(v), run: (v) => overturn(v.id, 'should_have_surfaced') },
  { id: 'ask', label: 'Ask', appliesTo: () => true, href: (v) => `/ask?item=${encodeURIComponent(v.id)}` },
  { id: 'handoff', label: 'Hand to Grok Bot', appliesTo: surfaced },
];

export function buttonsFor(v: ItemView): ActionButton[] {
  return ACTIONS.filter((a) => a.appliesTo(v)).map((a) => ({ id: a.id, label: a.label, href: a.href?.(v) }));
}

export function runAction(actionId: string, v: ItemView): boolean {
  const action = ACTIONS.find((a) => a.id === actionId);
  if (!action?.run || !action.appliesTo(v)) return false;
  action.run(v);
  return true;
}
