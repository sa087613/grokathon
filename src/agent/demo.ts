import { getMeta, setMeta, wipeDb, getDb } from '@/lib/db';
import { fetchAll } from '@/ingest';
import { listRejected, overturn, allViews, recordRun, saveItem, saveProfile } from '@/lib/store';
import type { StoreProfile } from '@/lib/types';
import { triagePending } from './radar';

const addDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

export function demoProfile(): StoreProfile {
  return {
    businessName: 'Lucky Magnolia Tacos',
    businessType: 'food_truck',
    homeCounty: 'Fulton',
    commissary: 'Westside Shared Kitchen, 1100 Howell Mill Rd NW, Atlanta',
    countiesOperated: ['Fulton', 'DeKalb'],
    permits: [
      { name: 'Mobile food service permit', issuer: 'Fulton County Board of Health', expires: addDays(58) },
      { name: 'Mobile food service permit', issuer: 'DeKalb County Board of Health', expires: addDays(120) },
      { name: 'Vending permit', issuer: 'City of Atlanta', expires: addDays(32) },
      { name: 'Vendor permit', issuer: 'Atlanta Police Department', expires: addDays(200) },
    ],
    carry: [
      { item: 'Onions, peppers and fresh produce', brands: ['Sunbelt Produce Co'] },
      { item: 'Corn and flour tortillas', brands: ['Red Clay Tortilla'] },
      { item: 'Chicken thighs', brands: ['Blue Ridge Poultry'] },
      { item: 'Spices and seasoning', brands: ['Old South Spice'] },
      { item: 'Crema and cotija', brands: ['Chattahoochee Creamery'] },
      { item: 'Salsas', brands: ['house-made'] },
    ],
    notes: ['Parks at Krog Street on weekdays and needs curb access by 10 AM'],
    headcount: 6,
    baseLocation: 'Krog Street and Edgewood Ave NE, Atlanta',
  };
}

/** Wipes everything and rebuilds the demo through the real pipeline, so seeded rows are real decisions. */
export async function seedDemo(): Promise<{ read: number; surfaced: number; rejected: number }> {
  const llmEnv = process.env.LLM_FIXTURE;
  const srcEnv = process.env.RADAR_SOURCES;
  process.env.LLM_FIXTURE = '1'; // The demo must never spend tokens or depend on the network.
  process.env.RADAR_SOURCES = 'fixture';
  try {
    const startedAt = new Date().toISOString();
    wipeDb();
    saveProfile(demoProfile());
    const { items } = await fetchAll();
    items.forEach(saveItem);

    // Older items first, then two owner overturns, then the rest, so recent items show the feedback working.
    const cutoff = addDays(-2);
    await triagePending((i) => i.publishedAt < cutoff);
    const find = (t: string) => allViews().find((v) => v.title.includes(t))?.id;
    const missed = find('Moreland Ave milling project');
    const noise = find('Sidewalk cafe');
    if (missed) overturn(missed, 'should_have_surfaced');
    if (noise) overturn(noise, 'didnt_need');
    await triagePending();

    const rejected = listRejected().length;
    const surfaced = items.length - rejected;
    recordRun(startedAt, items.length, surfaced, []);
    setMeta('demo_date', today());
    return { read: items.length, surfaced, rejected };
  } finally {
    if (llmEnv === undefined) delete process.env.LLM_FIXTURE; else process.env.LLM_FIXTURE = llmEnv;
    if (srcEnv === undefined) delete process.env.RADAR_SOURCES; else process.env.RADAR_SOURCES = srcEnv;
  }
}

let pending: Promise<unknown> | null = null;

/** Seeds an empty database and refreshes demo data once a day. A database set up for real use has no demo_date. */
export async function ensureDemoFresh(): Promise<void> {
  const empty = !(getDb().prepare('SELECT 1 FROM store_profile').get());
  const stale = getMeta('demo_date') !== null && getMeta('demo_date') !== today();
  if (!empty && !stale) return;
  pending ??= seedDemo().finally(() => { pending = null; });
  await pending;
}
