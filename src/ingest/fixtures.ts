import fs from 'node:fs';
import path from 'node:path';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function fixturePath(name: string): string {
  return path.join(process.cwd(), 'fixtures', name);
}

/** Replaces {{iso-3}}, {{ymd+1}} and {{long+14}} with dates relative to today, keeping demo data fresh. */
export function resolveDates(text: string, now = new Date()): string {
  return text.replace(/\{\{(iso|ymd|long)([+-]\d+)\}\}/g, (_, fmt: string, offset: string) => {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + Number(offset)));
    const iso = d.toISOString().slice(0, 10);
    if (fmt === 'iso') return iso;
    if (fmt === 'ymd') return iso.replace(/-/g, '');
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  });
}

export function readFixture(name: string): string {
  return resolveDates(fs.readFileSync(fixturePath(name), 'utf8'));
}

export function sourceMode(): 'fixture' | 'live' {
  return process.env.RADAR_SOURCES === 'live' ? 'live' : 'fixture';
}

export const USER_AGENT = 'PeachtreeRadar/0.1 (compliance monitoring)';

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'user-agent': USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}
