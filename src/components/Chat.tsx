'use client';

import { useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = ['What do I need to do today?', 'When do my permits expire?', 'Any recalls on onions?', 'What did you reject?'];

export function Chat({ item }: { item: { id: string; title: string } | null }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState(item ? 'Why did this get this decision?' : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const shown: Msg[] = [...messages, { role: 'user', content: text }];
    const tagged = item && !messages.length ? `[item:${item.id}] ${text}` : text;
    setMessages(shown);
    setInput('');
    setBusy(true);
    setError('');
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: tagged }] }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return setError('The radar could not answer just now. Try again.');
    const { answer } = await res.json();
    setMessages([...shown, { role: 'assistant', content: answer }]);
  }

  return (
    <div>
      {item && <p className="mb-4 text-sm text-muted">About: {item.title}</p>}
      <div className="space-y-5" aria-live="polite">
        {messages.map((m, i) => (
          <p key={i} className={`whitespace-pre-line text-sm ${m.role === 'user' ? 'font-medium' : 'text-muted'}`}>{m.content}</p>
        ))}
        {busy && <p className="text-sm text-muted">Looking…</p>}
        {error && <p role="alert" className="text-sm text-peach-deep">{error}</p>}
      </div>
      {!messages.length && !item && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:text-ink">{s}</button>)}
        </div>
      )}
      <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input aria-label="Your question" className="field" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about any item, permit or rejection" />
        <button disabled={busy} className="rounded-md bg-peach-deep px-4 text-sm text-white hover:bg-peach disabled:opacity-50">Ask</button>
      </form>
    </div>
  );
}
