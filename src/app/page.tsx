import Link from 'next/link';
import { ensureDemoFresh } from '@/agent/demo';
import { ItemCard } from '@/components/ItemCard';
import { getMeta } from '@/lib/db';
import { formatTime } from '@/lib/format';
import { latestRun, listByDecision } from '@/lib/store';
import { TOPIC_LABELS, type DecisionKind, type Topic } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TABS: { id: string; label: string; kind: DecisionKind }[] = [
  { id: 'action', label: 'Needs action', kind: 'NEEDS_ACTION' },
  { id: 'check', label: 'To check', kind: 'TO_CHECK' },
  { id: 'file', label: 'For the file', kind: 'FOR_THE_FILE' },
];

export default async function Overview({ searchParams }: { searchParams: { tab?: string; topic?: string } }) {
  await ensureDemoFresh();
  const tab = TABS.find((t) => t.id === searchParams.tab) ?? TABS[0];
  const topic = searchParams.topic && searchParams.topic in TOPIC_LABELS ? (searchParams.topic as Topic) : undefined;
  const run = latestRun();
  const inTab = listByDecision(tab.kind);
  const shown = topic ? inTab.filter((v) => v.topic === topic) : inTab;
  const counts = Object.keys(TOPIC_LABELS).map((t) => [t as Topic, inTab.filter((v) => v.topic === t).length] as const).filter(([, n]) => n > 0);
  const link = (q: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries(q).filter((e): e is [string, string] => !!e[1]));
    return `/?${p}`;
  };

  return (
    <>
      <section className="pb-8">
        <p className="text-sm text-muted">{run ? `Checked today at ${formatTime(run.finishedAt ?? run.startedAt)} ET` : 'Not checked yet'}</p>
        <h1 className="mt-2 font-serif text-3xl">
          {run?.itemsRead ?? 0} items read. <span className="text-peach-deep">{run?.itemsSurfaced ?? 0} surfaced.</span>
        </h1>
        {getMeta('demo_date') && <p className="mt-3 text-xs text-muted">Demo data. Every firm, recall and ordinance here is invented. Resets daily.</p>}
        {!!run?.failures.length && <p role="alert" className="mt-3 text-sm text-peach-deep">Not fully checked: {run.failures.join('; ')}.</p>}
      </section>

      <nav className="flex gap-6 border-b border-line text-sm">
        {TABS.map((t) => (
          <Link key={t.id} href={link({ tab: t.id })} className={`-mb-px border-b-2 pb-3 ${t.id === tab.id ? 'border-peach text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            {t.label} <span className="text-muted">{listByDecision(t.kind).length}</span>
          </Link>
        ))}
      </nav>

      {counts.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-4 text-xs">
          {counts.map(([t, n]) => (
            <Link key={t} href={link({ tab: tab.id, topic: t === topic ? undefined : t })} className={`rounded-full px-3 py-1 ${t === topic ? 'bg-peach-soft text-peach-deep' : 'text-muted hover:text-ink'}`}>
              {TOPIC_LABELS[t]} {n}
            </Link>
          ))}
        </div>
      )}

      {shown.length ? shown.map((v) => <ItemCard key={v.id} view={v} />) : <p className="py-16 text-center text-muted">Nothing here. That is the point.</p>}
    </>
  );
}
