import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { DEMO_BASE, JOB_LABELS, demoJobs, summarizeJobs, type JobKind } from '@/lib/streetJobs';
import { TOPIC_LABELS, type ItemView, type Topic } from '@/lib/types';
import { StreetMap } from './StreetMap';

const SWATCH: Record<JobKind, string> = { street: 'bg-job-street', repaving: 'bg-job-repaving', nodig: 'bg-job-nodig', building: 'bg-job-building' };

export function TopicTable({ views, topicHref }: { views: ItemView[]; topicHref: (t: Topic) => string }) {
  const flagged = (list: ItemView[]) => list.filter((v) => v.decision.effective !== 'REJECT').length;
  return (
    <section>
      <h2 className="section-head">By topic</h2>
      <ul>
        {(Object.keys(TOPIC_LABELS) as Topic[]).map((t) => {
          const list = views.filter((v) => v.topic === t);
          const n = flagged(list);
          return (
            <li key={t} className="border-b border-line">
              <Link href={topicHref(t)} className="label grid grid-cols-[1fr_3rem_2.5rem] py-3 hover:text-link">
                <span>{TOPIC_LABELS[t]}</span>
                <span className="text-right text-muted">{list.length}</span>
                <span className={n ? 'text-right font-medium text-brick' : 'text-right text-muted'}>{n || '–'}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="label mt-px grid grid-cols-[1fr_3rem_2.5rem] border-t-2 border-ink py-3">
        <span>Total flagged</span>
        <span className="text-right text-muted">{views.length}</span>
        <span className="text-right font-medium text-brick">{flagged(views)}</span>
      </p>
    </section>
  );
}

export function StreetWork() {
  const jobs = demoJobs();
  if (!jobs.length) return null;
  const { nearest, nearbyStreets, jobsOnNearest, counts } = summarizeJobs(jobs);
  return (
    <section className="mt-10">
      <h2 className="section-head">Street work</h2>
      <p className="my-3 text-sm leading-relaxed">
        <strong className="font-semibold">Work on {nearbyStreets} {nearbyStreets === 1 ? 'street' : 'streets'} near your base.</strong> Any of it can take your curb space or slow the run from the commissary.
      </p>
      <StreetMap jobs={jobs} base={DEMO_BASE} />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {counts.map((c) => (
          <li key={c.kind} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 ${SWATCH[c.kind]}`} />{JOB_LABELS[c.kind]} <span className="font-mono">{c.count}</span></li>
        ))}
      </ul>
      {nearest && (
        <div className="mt-3 text-sm">
          <p className="flex justify-between gap-4 font-medium"><span>{nearest.street}</span><span className="font-mono text-xs text-muted">{nearest.meters} m</span></p>
          <p className="text-muted">{nearest.detail}</p>
          <p className="text-muted">Valid through {formatDate(nearest.validThrough)} · {jobsOnNearest} jobs</p>
        </div>
      )}
    </section>
  );
}
