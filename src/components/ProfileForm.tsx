'use client';

import { useState } from 'react';
import type { StoreProfile } from '@/lib/types';

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm"><span className="mb-1 block text-muted">{label}</span>{children}</label>;
}

export function ProfileForm({ initial }: { initial: StoreProfile }) {
  const [p, setP] = useState(initial);
  const [counties, setCounties] = useState(initial.countiesOperated.join(', '));
  const [suppliers, setSuppliers] = useState(initial.suppliers.join(', '));
  const [status, setStatus] = useState('');
  const set = (patch: Partial<StoreProfile>) => { setP({ ...p, ...patch }); setStatus(''); };
  const setPermit = (i: number, key: 'name' | 'issuer' | 'expires', value: string) =>
    set({ permits: p.permits.map((x, j) => (j === i ? { ...x, [key]: value } : x)) });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...p, countiesOperated: list(counties), suppliers: list(suppliers) }),
    });
    setStatus(res.ok ? 'Saved.' : (await res.json()).error ?? 'Could not save.');
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Field label="Business name"><input className="field" value={p.businessName} onChange={(e) => set({ businessName: e.target.value })} /></Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Business type">
          <select className="field" value={p.businessType} onChange={(e) => set({ businessType: e.target.value as StoreProfile['businessType'] })}>
            <option value="food_truck">Food truck</option>
            <option value="restaurant">Restaurant</option>
          </select>
        </Field>
        <Field label="Home county">
          <select className="field" value={p.homeCounty} onChange={(e) => set({ homeCounty: e.target.value as StoreProfile['homeCounty'] })}>
            <option>Fulton</option>
            <option>DeKalb</option>
          </select>
        </Field>
        <Field label="Headcount"><input type="number" min={0} className="field" value={p.headcount} onChange={(e) => set({ headcount: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Commissary location"><input className="field" value={p.commissary} onChange={(e) => set({ commissary: e.target.value })} /></Field>
      <Field label="Address or base location"><input className="field" value={p.baseLocation} onChange={(e) => set({ baseLocation: e.target.value })} /></Field>
      <Field label="Counties operated in, comma separated"><input className="field" value={counties} onChange={(e) => { setCounties(e.target.value); setStatus(''); }} /></Field>
      <Field label="Carried suppliers and brands, comma separated"><textarea rows={3} className="field" value={suppliers} onChange={(e) => { setSuppliers(e.target.value); setStatus(''); }} /></Field>
      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm text-muted">Permits held</legend>
        {p.permits.map((x, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_9rem_auto]">
            <input aria-label="Permit name" className="field" value={x.name} onChange={(e) => setPermit(i, 'name', e.target.value)} />
            <input aria-label="Issuer" className="field" value={x.issuer} onChange={(e) => setPermit(i, 'issuer', e.target.value)} />
            <input aria-label="Expires" type="date" className="field" value={x.expires} onChange={(e) => setPermit(i, 'expires', e.target.value)} />
            <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => set({ permits: p.permits.filter((_, j) => j !== i) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="text-sm text-muted hover:text-peach-deep" onClick={() => set({ permits: [...p.permits, { name: '', issuer: '', expires: '' }] })}>Add permit</button>
      </fieldset>
      <div className="flex items-center gap-4">
        <button className="rounded-md bg-peach-deep px-4 py-2 text-sm text-white hover:bg-peach">Save profile</button>
        <span role="status" className="text-sm text-muted">{status}</span>
      </div>
    </form>
  );
}
