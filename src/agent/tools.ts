import type { ToolDef } from '@/lib/llm';
import { allViews, getProfile, getView, listRejected, searchItems } from '@/lib/store';
import type { ItemView } from '@/lib/types';

const brief = (v: ItemView) => ({
  id: v.id, title: v.title, source: v.source, published: v.publishedAt, decision: v.decision.effective,
  reason: v.decision.reason, deadline: v.decision.deadline ?? null, suggestedAction: v.decision.suggestedAction ?? null,
  overturned: v.decision.overridden, resolved: !!v.resolvedAt,
});

const obj = (properties: Record<string, unknown> = {}, required: string[] = []) => ({ type: 'object', properties, required });

export const TOOLS: ToolDef[] = [
  { name: 'search_items', description: 'Search every item read, surfaced or rejected, by keywords.', parameters: obj({ query: { type: 'string' } }, ['query']) },
  { name: 'get_decision', description: 'Get the full decision and source text for one item id.', parameters: obj({ id: { type: 'string' } }, ['id']) },
  { name: 'list_open_actions', description: 'List unresolved items that need action, soonest deadline first.', parameters: obj() },
  { name: 'get_store_profile', description: 'Get the store profile, including permits and suppliers.', parameters: obj() },
  { name: 'list_rejected', description: 'List rejected items with reasons.', parameters: obj() },
];

export function runTool(name: string, args: Record<string, unknown>): unknown {
  switch (name) {
    case 'search_items':
      return searchItems(String(args.query ?? '')).map(brief);
    case 'get_decision': {
      const v = getView(String(args.id ?? ''));
      return v ? { ...brief(v), text: v.rawText.slice(0, 4000), url: v.url } : { error: 'No such item' };
    }
    case 'list_open_actions':
      return allViews()
        .filter((v) => v.decision.effective === 'NEEDS_ACTION' && !v.resolvedAt)
        .sort((a, b) => (a.decision.deadline ?? '9').localeCompare(b.decision.deadline ?? '9'))
        .map(brief);
    case 'get_store_profile':
      return getProfile();
    case 'list_rejected':
      return listRejected().slice(0, 30).map(brief);
    default:
      return { error: `Unknown tool ${name}` };
  }
}
