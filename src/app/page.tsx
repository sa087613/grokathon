import Link from 'next/link';
import { buttonsFor } from '@/actions/registry';
import { ItemCard } from '@/components/ItemCard';
import { FilterMenu, TextMenu } from '@/components/Menus';
import { StreetWork, TopicTable } from '@/components/Sidebar';
import { formatDate } from '@/lib/format';
import { recallProducts, recallUpc } from '@/lib/products';
import { allViews, latestRun } from '@/lib/store';
import { TOPIC_LABELS, type DecisionKind, type Topic } from '@/lib/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TABS: { id: string; label: string; kind: DecisionKind }[] = [
  { id: 'action', label: 'Needs action', kind: 'NEEDS_ACTION' },
  { id: 'check', label: 'To check', kind: 'TO_CHECK' },
  { id: 'file', label: 'For the file', kind: 'FOR_THE_FILE' },
];
const RANGES = [{ id: '3', label: 'Last 3 days' }, { id: '7', label: 'Last 7 days' }, { id: 'all', label: 'Everything read' }];

export default function Overview({ searchParams }: { searchParams: { tab?: string; topic?: string; range?: string } }) {
  const tabId = searchParams.tab === 'resolved' ? 'resolved' : TABS.find((t) => t.id === searchParams.tab)?.id ?? 'action';
  const topic = searchParams.topic && searchParams.topic in TOPIC_LABELS ? (searchParams.topic as Topic) : undefined;
  const range = RANGES.find((r) => r.id === searchParams.range) ?? RANGES[2];
  const since = range.id === 'all' ? '' : new Date(Date.now() - Number(range.id) * 86_400_000).toISOString().slice(0, 10);

  const views = allViews().filter((v) => v.publishedAt >= since);
  const open = views.filter((v) => !v.resolvedAt);
  const count = (k: DecisionKind) => open.filter((v) => v.decision.effective === k).length;
  const inTab = tabId === 'resolved' ? views.filter((v) => v.resolvedAt) : open.filter((v) => v.decision.effective === TABS.find((t) => t.id === tabId)!.kind);
  const shown = topic ? inTab.filter((v) => v.topic === topic) : inTab;
  const failures = latestRun()?.failures ?? [];
  const actions = count('NEEDS_ACTION');
  const dates = views.map((v) => v.publishedAt).sort();

  const href = (q: { tab?: string; topic?: string; range?: string }) => {
    const merged = { tab: tabId, range: range.id === 'all' ? undefined : range.id, ...q };
    const p = new URLSearchParams(Object.entries(merged).filter((e): e is [string, string] => !!e[1]));
    return `/?${p}`;
  };
  const topicLinks = (Object.keys(TOPIC_LABELS) as Topic[]).map((t) => ({ href: href({ topic: t }), label: TOPIC_LABELS[t], count: inTab.filter((v) => v.topic === t).length }));
  const label = `${shown.length} ${tabId === 'resolved' ? 'resolved' : 'open'} ${topic ? `in ${TOPIC_LABELS[topic]}` : 'across every topic'}.`;

  return (
    <>
      <section className="dotted py-12 text-center sm:py-20">
        <TextMenu
          className="label mx-auto inline-flex items-center gap-2 text-ink/75"
          label={dates.length ? `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}` : range.label}
          links={RANGES.map((r) => ({ href: href({ range: r.id === 'all' ? undefined : r.id }), label: r.label }))}
        />
        <h1 className="hero mx-auto mt-5 max-w-3xl text-balance">
          {actions ? `${actions} ${actions === 1 ? 'item needs' : 'items need'} your signature.` : 'Nothing needs your signature.'}
        </h1>
        <p className="mt-5 text-ink/75">{views.length} read · {views.filter((v) => v.decision.effective !== 'REJECT').length} brought to you</p>
        {failures.length > 0 && <p role="alert" className="mt-4 text-sm text-brick">Not fully checked: {failures.join('; ')}.</p>}
      </section>

      <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <nav className="grid flex-1 grid-cols-2 border border-ink text-sm sm:inline-grid sm:flex-none sm:grid-flow-col sm:auto-cols-auto">
              {TABS.map((t) => (
                <Link key={t.id} href={href({ tab: t.id, topic: undefined })} aria-current={t.id === tabId ? 'page' : undefined}
                  className={cn('border-ink px-4 py-3 text-center sm:border-r', t.id === tabId ? 'bg-ink font-semibold text-paper' : 'hover:bg-raise')}>
                  {t.label} <span className="ml-1 font-mono text-xs opacity-70">{count(t.kind)}</span>
                </Link>
              ))}
              <TextMenu className="flex items-center justify-center gap-2 px-4 py-3 hover:bg-raise" label="The record" links={[
                { href: '/rejected', label: 'Rejected log', count: views.filter((v) => v.decision.effective === 'REJECT').length },
                { href: href({ tab: 'resolved', topic: undefined }), label: 'Resolved', count: views.filter((v) => v.resolvedAt).length },
              ]} />
            </nav>
            <FilterMenu links={[{ href: href({ topic: undefined }), label: 'All topics', count: inTab.length }, ...topicLinks]} />
          </div>
          <h2 className="section-head mt-6">{label}</h2>
          {shown.length
            ? shown.map((v) => <ItemCard key={v.id} view={v} buttons={buttonsFor(v)} products={recallProducts(v)} upc={recallUpc(v.rawText)} />)
            : <p className="py-16 text-center text-muted">Quiet here. That is the point.</p>}
        </div>
        <aside>
          <TopicTable views={views} topicHref={(t) => href({ topic: t })} />
          <StreetWork />
        </aside>
      </div>
    </>
  );
}
