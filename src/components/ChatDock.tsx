'use client';

import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chat } from './Chat';

type ChatItem = { id: string; title: string };

export const openChat = (item: ChatItem | null = null) => window.dispatchEvent(new CustomEvent('peachtree:ask', { detail: item }));

export function ChatDock() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ChatItem | null>(null);

  useEffect(() => {
    const listener = (e: Event) => { setItem((e as CustomEvent<ChatItem | null>).detail); setOpen(true); };
    window.addEventListener('peachtree:ask', listener);
    return () => window.removeEventListener('peachtree:ask', listener);
  }, []);

  return (
    <>
      {open && (
        <section aria-label="Ask the radar" className="fixed inset-x-2 bottom-2 z-[950] flex max-h-[80vh] flex-col border-3 border-ink bg-paper p-5 sm:inset-x-auto sm:bottom-24 sm:right-8 sm:w-[420px]">
          <div className="section-head mb-4 flex items-center justify-between">
            Ask the radar
            <button aria-label="Close" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
          </div>
          <Chat key={item?.id ?? 'general'} item={item} />
        </section>
      )}
      <button aria-label="Ask the radar" onClick={() => { setItem(null); setOpen(!open); }}
        className="fixed bottom-5 right-5 z-[940] flex h-14 w-14 items-center justify-center rounded-full border-3 border-ink bg-paper hover:bg-panel sm:right-8">
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
