'use client';

import { Check, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

// Mirrors src/partners/grokbot.ts, which can't be imported here because it touches the database.
const STEPS = ['drafted', 'sent', 'awaiting_approval', 'done'] as const;
const LABELS = { drafted: 'Drafted', sent: 'Sent to bot', awaiting_approval: 'Awaiting approval', done: 'Done' };
type Step = (typeof STEPS)[number];
type State = { mode: 'simulated' | 'manual'; status: Step | null; packet: string };

export function PartnerDrawer({ itemId, itemTitle, onClose }: { itemId: string; itemTitle: string; onClose: () => void }) {
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const url = `/api/partner/${encodeURIComponent(itemId)}`;
  const urlRef = useRef(url);

  async function send(body: object) {
    const res = await fetch(urlRef.current, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) { setState(await res.json()); setError(''); } else setError('That did not save. Try again.');
  }

  useEffect(() => { send({ op: 'start' }); }, []);

  // Simulated runs walk forward on their own and stop at the approval gate.
  useEffect(() => {
    if (state?.mode !== 'simulated' || (state.status !== 'drafted' && state.status !== 'sent')) return;
    const t = setTimeout(() => send({ op: 'advance' }), 700);
    return () => clearTimeout(t);
  }, [state?.mode, state?.status]);

  const at = state?.status ? STEPS.indexOf(state.status) : -1;
  return (
    <aside aria-label="Grok Bot handoff" className="fixed inset-y-0 right-0 z-[960] w-full space-y-5 overflow-y-auto border-l-2 border-ink bg-panel p-5 sm:w-[440px]">
      <div className="section-head flex items-center justify-between">
        Hand to Grok Bot
        <button aria-label="Close" onClick={onClose}><X className="h-4 w-4" /></button>
      </div>
      {state?.mode === 'simulated' && <Badge variant="solid">Simulated</Badge>}
      {state?.mode === 'manual' && <Badge>Manual</Badge>}
      <p className="font-semibold">{itemTitle}</p>
      <ol aria-label="Status timeline">
        {STEPS.map((s, i) => (
          <li key={s} className={cn('flex items-center gap-3 border-b border-line py-2.5 text-sm', i > at && 'text-muted')}>
            <span className={cn('flex h-5 w-5 items-center justify-center border border-line-strong', i <= at && 'border-ink bg-ink text-paper')}>{i <= at && <Check className="h-3 w-3" />}</span>
            {LABELS[s]}
          </li>
        ))}
      </ol>
      {state?.mode === 'simulated' && state.status === 'awaiting_approval' && <Button onClick={() => send({ op: 'approve' })}>Approve</Button>}
      {state?.mode === 'simulated' && <p className="text-sm text-muted">Nothing is sent. This run is a local simulation.</p>}
      {state?.mode === 'manual' && (
        <>
          <pre className="whitespace-pre-wrap border border-line-strong bg-paper p-3 font-mono text-xs">{state.packet}</pre>
          <Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(state.packet); setCopied(true); }}>{copied ? 'Copied' : 'Copy task packet'}</Button>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Status</span>
            <select className="field" value={state.status ?? 'drafted'} onChange={(e) => send({ op: 'set', status: e.target.value })}>
              {STEPS.map((s) => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>
          </label>
        </>
      )}
      {error && <p role="alert" className="text-sm text-brick">{error}</p>}
    </aside>
  );
}
