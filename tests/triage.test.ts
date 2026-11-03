import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { demoProfile, ensureDemoFresh, seedDemo } from '@/agent/demo';
import { firstUpcomingDate, streetNames, triageFixture } from '@/agent/fixtureBrain';
import { runRadar } from '@/agent/radar';
import { triageItem, validateTriage } from '@/agent/triage';
import { getDb, setMeta, wipeDb } from '@/lib/db';
import { allViews, getView, listRejected, overturn, saveItem, saveProfile } from '@/lib/store';
import { item } from './helpers';

describe('triage', () => {
  beforeEach(() => { wipeDb(); saveProfile(demoProfile()); });
  afterEach(() => vi.unstubAllGlobals());

  it('validates model output and rejects malformed replies', () => {
    expect(validateTriage({ decision: 'NOPE', reason: 'x' })).toBeNull();
    expect(validateTriage({ decision: 'REJECT', reason: '' })).toBeNull();
    expect(validateTriage({ decision: 'REJECT', reason: 'a\nb', deadline: 'soon' })).toEqual({ decision: 'REJECT', reason: 'a', actionable: false });
  });

  it('flags a recall naming a carried supplier', () => {
    const r = triageFixture(item({ source: 'openfda', title: 'Red Clay Tortilla recall' }), demoProfile(), []);
    expect(r.decision).toBe('NEEDS_ACTION');
  });

  it('rejects mobile rules for a county the truck does not work', () => {
    const r = triageFixture(item({ source: 'county-health', title: 'Cobb County mobile unit rule' }), demoProfile(), []);
    expect(r.decision).toBe('REJECT');
  });

  it('screens long documents on the title before any full read', async () => {
    const long = item({ id: 'c:1', source: 'atlanta-council', title: 'Bond refunding', rawText: 'x '.repeat(800) });
    saveItem(long);
    await triageItem(long, demoProfile());
    expect(getView('c:1')!.decision.stage).toBe('screen');
    const keep = item({ id: 'c:2', source: 'atlanta-council', title: 'Mobile food vending zones', rawText: 'y '.repeat(800) });
    saveItem(keep);
    await triageItem(keep, demoProfile());
    expect(getView('c:2')!.decision.stage).toBe('full');
  });

  it('stores input, model and timestamp on each decision row', async () => {
    const i = item();
    saveItem(i);
    await triageItem(i, demoProfile());
    const d = getView(i.id)!.decision;
    expect(d.input).toContain('Store profile');
    expect(d.model).toBe('fixture');
    expect(d.overridden).toBe(false);
    expect(d.createdAt).toBeTruthy();
  });

  it('lets an overturn change later decisions both ways', async () => {
    const first = item({ id: 'a', title: 'Moreland Ave milling project', rawText: 'Milling on Moreland Ave south of I-20.' });
    saveItem(first);
    await triageItem(first, demoProfile());
    expect(getView('a')!.decision.effective).toBe('REJECT');
    overturn('a', 'should_have_surfaced');
    expect(getView('a')!.decision.effective).toBe('TO_CHECK');

    const next = item({ id: 'b', title: 'Moreland Ave milling project phase two', rawText: 'Milling on Moreland Ave north of I-20.' });
    saveItem(next);
    await triageItem(next, demoProfile());
    expect(getView('b')!.decision.decision).toBe('TO_CHECK');
    expect(getView('b')!.decision.input).toContain('OWNER OVERTURNED');

    overturn('a', 'didnt_need');
    overturn('b', 'didnt_need');
    const third = item({ id: 'c', title: 'Moreland Ave milling project phase three', rawText: 'Milling on Moreland Ave at I-20.' });
    saveItem(third);
    await triageItem(third, demoProfile());
    expect(getView('c')!.decision.decision).toBe('REJECT');
  });

  it('parses dates and street names', () => {
    expect(firstUpcomingDate('by January 2, 2020 or March 3, 2099')).toBe('2099-03-03');
    expect(streetNames('1100 Howell Mill Rd NW, Krog Street and Edgewood Ave NE')).toEqual(['Howell Mill', 'Krog', 'Edgewood']);
  });
});

describe('demo and radar', () => {
  beforeEach(() => wipeDb());

  it('seeds all four decisions and a live overturn', async () => {
    const r = await seedDemo();
    expect(r.read).toBe(60);
    const kinds = new Set(allViews().map((v) => v.decision.effective));
    expect(kinds).toEqual(new Set(['NEEDS_ACTION', 'TO_CHECK', 'FOR_THE_FILE', 'REJECT']));
    expect(allViews().find((v) => v.title.includes('phase two'))!.decision.reason).toContain('similar');
    expect(listRejected().length).toBeGreaterThan(30);
  });

  it('does not re-triage on a second run', async () => {
    await seedDemo();
    const before = getDb().prepare('SELECT count(*) c FROM decisions').get();
    const run = await runRadar();
    expect(getDb().prepare('SELECT count(*) c FROM decisions').get()).toEqual(before);
    expect(run.surfaced).toBe(allViews().filter((v) => v.decision.effective !== 'REJECT').length);
  });

  it('resets stale demo data but leaves a real database alone', async () => {
    await seedDemo();
    overturn(allViews()[0].id, 'didnt_need');
    setMeta('demo_date', '2000-01-01');
    await ensureDemoFresh();
    expect(allViews().filter((v) => v.decision.overridden)).toHaveLength(2);

    getDb().prepare("DELETE FROM meta WHERE key = 'demo_date'").run();
    overturn(allViews()[0].id, 'didnt_need');
    const count = allViews().filter((v) => v.decision.overridden).length;
    await ensureDemoFresh();
    expect(allViews().filter((v) => v.decision.overridden)).toHaveLength(count);
  });
});
