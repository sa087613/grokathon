import { buttonsFor } from '@/actions/registry';
import { ItemActions } from '@/components/ItemActions';
import { SOURCE_TAGS, formatDate } from '@/lib/format';
import { listRejected } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default function Rejected() {
  const rows = listRejected();
  return (
    <>
      <section className="dotted py-12 text-center sm:py-20">
        <h1 className="hero">What I left out</h1>
        <p className="mx-auto mt-5 max-w-xl text-ink/75">{rows.length} items kept out of your way, each with its reason. Overturn one and later runs treat it as precedent.</p>
      </section>
      <div className="mx-auto max-w-3xl pt-10">
        <h2 className="section-head">Rejected log</h2>
        {rows.map((v) => (
          <article key={v.id} className="border-b border-line py-4">
            <p className="label text-muted">{SOURCE_TAGS[v.source]} · {formatDate(v.publishedAt)}{v.decision.overrideKind === 'didnt_need' ? ' · Dismissed by you' : ''}</p>
            <h3 className="mt-2 font-semibold">{v.title}</h3>
            <p className="mt-1 text-sm text-muted">{v.decision.reason}</p>
            <div className="-ml-2 mt-2"><ItemActions itemId={v.id} itemTitle={v.title} buttons={buttonsFor(v)} /></div>
          </article>
        ))}
      </div>
    </>
  );
}
