'use client';

import { ChevronDown, ChevronUp, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { ActionButton } from '@/actions/registry';
import { SOURCE_TAGS, formatDate } from '@/lib/format';
import type { Product } from '@/lib/products';
import type { DecisionKind, ItemView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Barcode } from './Barcode';
import { ItemActions } from './ItemActions';
import { Badge } from './ui/badge';

const TAG: Record<DecisionKind, { text: string; variant: 'urgent' | 'solid' | 'outline' }> = {
  NEEDS_ACTION: { text: 'Action needed', variant: 'urgent' },
  TO_CHECK: { text: 'To check', variant: 'solid' },
  FOR_THE_FILE: { text: 'For the file', variant: 'outline' },
  REJECT: { text: 'Rejected', variant: 'outline' },
};

const CLASS_HELP: Record<string, string> = {
  'Class I': 'FDA Class I: serious health risk.',
  'Class II': 'FDA Class II: temporary or reversible health risk.',
  'Class III': 'FDA Class III: unlikely to cause harm.',
};

export function ItemCard({ view, buttons, products, upc }: { view: ItemView; buttons: ActionButton[]; products: Product[]; upc: string | null }) {
  const [open, setOpen] = useState(false);
  const d = view.decision;
  const urgent = d.effective === 'NEEDS_ACTION';
  const toggle = products.length ? (open ? 'Hide the products' : 'Show the products') : open ? 'Hide details' : 'Show details';
  return (
    <article className="border-b-3 border-ink bg-panel">
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant={TAG[d.effective].variant}>{TAG[d.effective].text}</Badge>
          <Badge>{SOURCE_TAGS[view.source]}</Badge>
          <Badge title={CLASS_HELP[view.classLabel]}>
            {view.classLabel}{CLASS_HELP[view.classLabel] && <Info className="h-3 w-3" />}
          </Badge>
        </div>
        <p className={cn('flex items-start gap-3 border px-4 py-3 text-sm', urgent ? 'border-brick/20 bg-brick-soft text-brick-deep' : 'border-line bg-paper')}>
          {urgent && <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}{d.reason}
        </p>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{view.title}</h3>
            <p className="mt-2 text-sm text-muted">
              Published {formatDate(view.publishedAt)} · Flagged {formatDate(d.createdAt)}
              {d.deadline && <span className="text-brick-deep"> · Due {formatDate(d.deadline)}</span>}
            </p>
          </div>
          {upc && <Barcode upc={upc} />}
        </div>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="text-link-plain flex items-center gap-1 text-sm">
          {toggle}{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {open && (products.length ? (
          <ul className="border border-line-strong">
            {products.map((p) => (
              <li key={p.name} className="border-b border-line-strong px-4 py-3 last:border-0">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">{p.details.join(' · ')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2 text-sm">
            {d.suggestedAction && <p className="font-medium">{d.suggestedAction}</p>}
            <p className="whitespace-pre-line text-muted">{view.rawText.slice(0, 1500)}</p>
            <a href={view.url} target="_blank" rel="noreferrer" className="text-link-plain">View source</a>
          </div>
        ))}
        {open && products.length > 0 && d.suggestedAction && <p className="text-sm font-medium">{d.suggestedAction}</p>}
      </div>
      <div className="border-t border-line px-2 py-2 sm:px-3"><ItemActions itemId={view.id} itemTitle={view.title} buttons={buttons} /></div>
    </article>
  );
}
