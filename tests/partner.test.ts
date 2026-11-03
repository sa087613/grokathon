import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { seedDemo } from '@/agent/demo';
import { allViews } from '@/lib/store';
import { applyOp, runState } from '@/partners/grokbot';

beforeAll(async () => { await seedDemo(); });
afterEach(() => vi.unstubAllEnvs());
const open = (n: number) => allViews().filter((v) => v.decision.effective === 'NEEDS_ACTION')[n].id;

describe('grok bot handoff', () => {
  it('stops at the approval gate until approved', () => {
    const id = open(0);
    applyOp(id, { op: 'start' });
    expect(applyOp(id, { op: 'approve' })).toBeTruthy();
    for (let i = 0; i < 5; i++) applyOp(id, { op: 'advance' });
    expect(runState(id)!.status).toBe('awaiting_approval');
    expect(applyOp(id, { op: 'approve' })).toBeNull();
    expect(runState(id)!.status).toBe('done');
  });

  it('lets the owner set status by hand only in manual mode', () => {
    const id = open(1);
    applyOp(id, { op: 'start' });
    expect(applyOp(id, { op: 'set', status: 'done' })).toBeTruthy();
    vi.stubEnv('PARTNER_MODE', 'manual');
    expect(applyOp(id, { op: 'set', status: 'done' })).toBeNull();
    expect(runState(id)!.packet).toContain('until the owner approves');
  });
});
