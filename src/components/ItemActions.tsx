'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ActionButton } from '@/actions/registry';

export function ItemActions({ itemId, buttons }: { itemId: string; buttons: ActionButton[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(id: string) {
    setBusy(true);
    setError('');
    const res = await fetch(`/api/items/${encodeURIComponent(itemId)}/actions/${id}`, { method: 'POST' });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError('That did not save. Try again.');
  }

  const style = 'text-muted hover:text-peach-deep disabled:opacity-50';
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
      {buttons.map((b) =>
        b.href ? <a key={b.id} href={b.href} className={style}>{b.label}</a>
          : <button key={b.id} disabled={busy} onClick={() => run(b.id)} className={style}>{b.label}</button>,
      )}
      {error && <span role="alert" className="text-peach-deep">{error}</span>}
    </div>
  );
}
