import { buttonsFor } from '@/actions/registry';
import { SOURCE_LABELS, formatDate } from '@/lib/format';
import type { ItemView } from '@/lib/types';
import { ItemActions } from './ItemActions';

export function ItemCard({ view }: { view: ItemView }) {
  const d = view.decision;
  return (
    <article className="border-b border-line py-6">
      <p className="text-xs text-muted">
        {SOURCE_LABELS[view.source]} · {view.classLabel} · {formatDate(view.publishedAt)}
      </p>
      <h3 className="mt-2 font-serif text-lg leading-snug">{view.title}</h3>
      <p className="mt-2 text-sm text-muted">{d.reason}</p>
      {d.deadline && <p className="mt-2 text-sm text-peach-deep">By {formatDate(d.deadline)}</p>}
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Details</summary>
        <div className="mt-3 space-y-3">
          {d.suggestedAction && <p>{d.suggestedAction}</p>}
          <p className="whitespace-pre-line text-muted">{view.rawText.slice(0, 1500)}</p>
          <p className="text-xs text-muted">
            Decided by {d.model} at the {d.stage === 'screen' ? 'title screen' : 'full read'}.{' '}
            <a href={view.url} className="underline" target="_blank" rel="noreferrer">Source</a>
          </p>
        </div>
      </details>
      <ItemActions itemId={view.id} buttons={buttonsFor(view)} />
    </article>
  );
}
