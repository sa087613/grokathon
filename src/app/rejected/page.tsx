import { ensureDemoFresh } from '@/agent/demo';
import { ItemActions } from '@/components/ItemActions';
import { buttonsFor } from '@/actions/registry';
import { SOURCE_LABELS, formatDate } from '@/lib/format';
import { listRejected } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Rejected() {
  await ensureDemoFresh();
  const rows = listRejected();
  return (
    <>
      <h1 className="font-serif text-3xl">Rejected</h1>
      <p className="mt-2 pb-6 text-sm text-muted">{rows.length} items kept out of your way. Overturn any of them and future triage learns from it.</p>
      {rows.map((v) => (
        <article key={v.id} className="border-t border-line py-4">
          <p className="text-xs text-muted">{SOURCE_LABELS[v.source]} · {formatDate(v.publishedAt)}{v.decision.overrideKind === 'didnt_need' ? ' · Dismissed by you' : ''}</p>
          <h3 className="mt-1 text-sm">{v.title}</h3>
          <p className="mt-1 text-sm text-muted">{v.decision.reason}</p>
          <ItemActions itemId={v.id} buttons={buttonsFor(v)} />
        </article>
      ))}
    </>
  );
}
