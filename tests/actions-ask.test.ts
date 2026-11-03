import { beforeAll, describe, expect, it } from 'vitest';
import { askRadar } from '@/agent/ask';
import { seedDemo } from '@/agent/demo';
import { runTool } from '@/agent/tools';
import { ACTIONS, buttonsFor, runAction } from '@/actions/registry';
import { plainBrief } from '@/actions/brief';
import { allViews, getView, listRejected } from '@/lib/store';

beforeAll(async () => { await seedDemo(); });

describe('actions', () => {
  it('offers the card actions on surfaced items', () => {
    const v = allViews().find((x) => x.decision.effective === 'NEEDS_ACTION')!;
    expect(buttonsFor(v).map((b) => b.label)).toEqual(['Resolve', 'Share via email', "Didn't need this", 'Ask']);
  });

  it('adds a new button with one registry entry', () => {
    const v = allViews()[0];
    ACTIONS.push({ id: 'new', label: 'New', appliesTo: () => true });
    expect(buttonsFor(v).some((b) => b.id === 'new')).toBe(true);
    ACTIONS.pop();
  });

  it('overturns a rejection from the log', () => {
    const v = listRejected()[0];
    expect(runAction('surface', v)).toBe(true);
    expect(getView(v.id)!.decision.effective).toBe('TO_CHECK');
  });

  it('refuses unknown or inapplicable actions', () => {
    const v = listRejected()[0];
    expect(runAction('nope', v)).toBe(false);
    expect(runAction('resolve', v)).toBe(false);
  });

  it('writes a plain text brief', () => {
    const v = allViews().find((x) => x.decision.suggestedAction)!;
    expect(plainBrief(v)).toContain('Suggested action:');
  });
});

describe('ask', () => {
  it('lists open actions', async () => {
    const r = await askRadar([{ role: 'user', content: 'What do I need to do today?' }]);
    expect(r.tools).toEqual(['list_open_actions']);
    expect(r.answer).toContain('found');
  });

  it('answers permit questions from the profile', async () => {
    const r = await askRadar([{ role: 'user', content: 'When do my permits expire?' }]);
    expect(r.answer).toContain('Fulton County Board of Health');
  });

  it('finds recalls by keyword', async () => {
    const r = await askRadar([{ role: 'user', content: 'Any recalls on onions?' }]);
    expect(r.answer).toContain('Sunbelt');
  });

  it('answers about one item and handles unknown ids', async () => {
    const id = allViews()[0].id;
    expect((await askRadar([{ role: 'user', content: `[item:${id}] why?` }])).tools).toEqual(['get_decision']);
    expect(runTool('get_decision', { id: 'nope' })).toEqual({ error: 'No such item' });
  });
});
