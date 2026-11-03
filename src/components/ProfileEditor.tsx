'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { applyFact, profileFacts, removeFact, type Fact } from '@/lib/facts';
import type { StoreProfile } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

function FactRow({ fact, onSave, onRemove }: { fact: Fact; onSave: (v: string) => void; onRemove: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(fact.value);
  if (editing) {
    return (
      <form className="flex flex-wrap items-center gap-2 border-b border-line py-3" onSubmit={(e) => { e.preventDefault(); onSave(value); setEditing(false); }}>
        {fact.input === 'select'
          ? <select aria-label={fact.fact} className="field flex-1" value={value} onChange={(e) => setValue(e.target.value)}>{fact.options!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          : <input aria-label={fact.fact} autoFocus type={fact.input} className="field flex-1" value={value} onChange={(e) => setValue(e.target.value)} />}
        <Button>Save</Button>
        <Button type="button" variant="ghost" onClick={() => { setValue(fact.value); setEditing(false); }}>Cancel</Button>
        {fact.removable && <Button type="button" variant="ghost" onClick={onRemove}>Remove</Button>}
      </form>
    );
  }
  return (
    <div className="group grid gap-1 border-b border-line py-3 hover:bg-panel sm:grid-cols-2 sm:gap-6 sm:px-3 sm:-mx-3">
      <p className="font-medium">{fact.fact}</p>
      <p className="flex items-start justify-between gap-4 text-ink/75">
        {fact.changes}
        <button onClick={() => setEditing(true)} className="text-link-plain text-sm sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100">Edit</button>
      </p>
    </div>
  );
}

function AddRow({ label, placeholders, onAdd }: { label: string; placeholders: string[]; onAdd: (values: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(placeholders.map(() => ''));
  if (!open) {
    return <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2 border-t-3 border-ink py-3 text-sm font-semibold"><Plus className="h-4 w-4" />{label}</button>;
  }
  return (
    <form className="flex flex-wrap gap-2 border-t-3 border-ink py-3" onSubmit={(e) => {
      e.preventDefault();
      if (!values[0].trim()) return;
      onAdd(values);
      setValues(placeholders.map(() => ''));
      setOpen(false);
    }}>
      {placeholders.map((p, i) => <input key={p} autoFocus={i === 0} aria-label={p} placeholder={p} className="field min-w-48 flex-1" value={values[i]} onChange={(e) => setValues(values.map((v, j) => (j === i ? e.target.value : v)))} />)}
      <Button>Add</Button>
    </form>
  );
}

export function ProfileEditor({ initial }: { initial: StoreProfile }) {
  const [profile, setProfile] = useState(initial);
  const [tab, setTab] = useState<'basics' | 'carry'>('basics');
  const [error, setError] = useState('');
  const facts = profileFacts(profile);

  async function save(next: StoreProfile) {
    setProfile(next);
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) }).catch(() => null);
    setError(res?.ok ? '' : 'That did not save. Try again.');
  }

  const TABS = [['basics', 'The basics', facts.length], ['carry', 'Carry list', profile.carry.length]] as const;
  return (
    <>
      <div className="mb-8 flex gap-6 border-b border-line">
        {TABS.map(([id, label, n]) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={cn('-mb-px border-b-2 pb-3 text-sm', tab === id ? 'border-ink font-semibold' : 'border-transparent text-muted hover:text-ink')}>
            {label} <span className="ml-1 font-mono text-xs">{n}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-brick-deep">{error}</p>}
      {tab === 'basics' ? (
        <section>
          <h2 className="section-head">The basics</h2>
          <p className="mt-2 pb-4 text-sm text-ink/75">Who you are and where you work decide which rules get a close read.</p>
          <div className="label hidden grid-cols-2 gap-6 border-b border-line pb-2 text-muted sm:grid"><span>The fact</span><span>What it changes</span></div>
          {facts.map((f) => <FactRow key={`${f.id}-${f.value}`} fact={f} onSave={(v) => save(applyFact(profile, f.id, v))} onRemove={() => save(removeFact(profile, f.id))} />)}
          <AddRow label="Tell the radar something else" placeholders={['A fact about your business']} onAdd={([n]) => save({ ...profile, notes: [...profile.notes, n.trim()] })} />
        </section>
      ) : (
        <section>
          <h2 className="section-head">Carry list</h2>
          <p className="mt-2 pb-4 text-sm text-ink/75">Recalls name a brand, so this is how the radar knows one is yours.</p>
          <div className="label hidden grid-cols-2 gap-6 border-b border-line pb-2 text-muted sm:grid"><span>Item</span><span>Brands to match</span></div>
          {profile.carry.map((c, i) => (
            <div key={c.item} className="group grid gap-2 border-b border-line py-3 sm:grid-cols-2 sm:gap-6">
              <p className="font-medium">{c.item}</p>
              <div className="flex items-start justify-between gap-4">
                <p className="flex flex-wrap gap-3">{c.brands.map((b) => <span key={b} className="bg-panel px-2 py-0.5 text-sm">{b}</span>)}</p>
                <button onClick={() => save({ ...profile, carry: profile.carry.filter((_, j) => j !== i) })} className="text-link-plain text-sm sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100">Remove</button>
              </div>
            </div>
          ))}
          <AddRow label="Add a carried item" placeholders={['Item', 'Brands, comma separated']} onAdd={([item, brands]) => save({ ...profile, carry: [...profile.carry, { item: item.trim(), brands: brands.split(',').map((b) => b.trim()).filter(Boolean) }] })} />
        </section>
      )}
    </>
  );
}
