import type { StoreProfile } from './types';

export interface Fact {
  id: string;
  fact: string;
  changes: string;
  value: string;
  input: 'text' | 'date' | 'number' | 'select';
  options?: [string, string][];
  removable?: boolean;
}

/** Turns the profile into plain sentences, each paired with what it does to triage. */
export function profileFacts(p: StoreProfile): Fact[] {
  const truck = p.businessType === 'food_truck';
  return [
    { id: 'type', fact: truck ? 'Runs a food truck' : 'Runs a restaurant', changes: truck ? 'Vending, mobile unit and commissary rules are read closely' : 'Mobile unit rules are not relevant', value: p.businessType, input: 'select', options: [['food_truck', 'Food truck'], ['restaurant', 'Restaurant']] },
    { id: 'county', fact: `Home county is ${p.homeCounty}`, changes: `${p.homeCounty} County Board of Health sets your main permit`, value: p.homeCounty, input: 'select', options: [['Fulton', 'Fulton'], ['DeKalb', 'DeKalb']] },
    { id: 'counties', fact: `Operates in ${p.countiesOperated.join(' and ')}`, changes: 'Health rule changes from any other county are dropped', value: p.countiesOperated.join(', '), input: 'text' },
    { id: 'commissary', fact: `Commissary: ${p.commissary}`, changes: 'Street work on the way there is flagged', value: p.commissary, input: 'text' },
    { id: 'base', fact: `Based at ${p.baseLocation}`, changes: 'Closures and curb loss nearby are flagged', value: p.baseLocation, input: 'text' },
    { id: 'headcount', fact: `About ${p.headcount} people on staff`, changes: 'Per-employee permit and ID rules scale with this', value: String(p.headcount), input: 'number' },
    ...p.permits.map((x, i): Fact => ({ id: `permit:${i}`, fact: `${x.name}, ${x.issuer}`, changes: `Expires ${x.expires}. Renewal notices are matched to it`, value: x.expires, input: 'date', removable: true })),
    ...p.notes.map((n, i): Fact => ({ id: `note:${i}`, fact: n, changes: 'Read with every item', value: n, input: 'text', removable: true })),
  ];
}

export function applyFact(p: StoreProfile, id: string, value: string): StoreProfile {
  const [key, idx] = id.split(':');
  const i = Number(idx);
  switch (key) {
    case 'type': return { ...p, businessType: value as StoreProfile['businessType'] };
    case 'county': return { ...p, homeCounty: value as StoreProfile['homeCounty'] };
    case 'counties': return { ...p, countiesOperated: value.split(',').map((s) => s.trim()).filter(Boolean) };
    case 'commissary': return { ...p, commissary: value };
    case 'base': return { ...p, baseLocation: value };
    case 'headcount': return { ...p, headcount: Number(value) || 0 };
    case 'permit': return { ...p, permits: p.permits.map((x, j) => (j === i ? { ...x, expires: value } : x)) };
    case 'note': return { ...p, notes: p.notes.map((x, j) => (j === i ? value : x)) };
    default: return p;
  }
}

export function removeFact(p: StoreProfile, id: string): StoreProfile {
  const [key, idx] = id.split(':');
  const i = Number(idx);
  if (key === 'permit') return { ...p, permits: p.permits.filter((_, j) => j !== i) };
  if (key === 'note') return { ...p, notes: p.notes.filter((_, j) => j !== i) };
  return p;
}
