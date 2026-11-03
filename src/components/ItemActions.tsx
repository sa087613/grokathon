'use client';

import { Bell, BellOff, Check, Mail, MessageSquare, Undo2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ActionButton } from '@/actions/registry';
import { Button } from './ui/button';
import { openChat } from './ChatDock';

const ICONS: Record<string, typeof Check> = { resolve: Check, share: Mail, dismiss: BellOff, surface: Bell, ask: MessageSquare };

export function ItemActions({ itemId, itemTitle, buttons }: { itemId: string; itemTitle: string; buttons: ActionButton[] }) {
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

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {buttons.map((b) => {
        const Icon = ICONS[b.id] ?? Undo2;
        const body = <><Icon className="h-4 w-4" />{b.label}</>;
        if (b.id === 'ask') return <Button key={b.id} variant="ghost" onClick={() => openChat({ id: itemId, title: itemTitle })}>{body}</Button>;
        if (b.href) return <Button key={b.id} variant="ghost" asChild><a href={b.href}>{body}</a></Button>;
        return <Button key={b.id} variant="ghost" disabled={busy} onClick={() => run(b.id)}>{body}</Button>;
      })}
      {error && <span role="alert" className="text-sm text-brick">{error}</span>}
    </div>
  );
}
