import type { ItemView } from './types';

export interface Product {
  name: string;
  details: string[];
}

/** Recall products come from the normalized text, so any openFDA item gets this for free. */
export function recallProducts(v: Pick<ItemView, 'source' | 'rawText'>): Product[] {
  if (v.source !== 'openfda') return [];
  const line = (key: string) => v.rawText.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1] ?? '';
  const codes = line('Codes').replace(/\s*UPC \d{12}\.?/, '').trim();
  const rows = line('Product').split(';').map((s) => s.trim()).filter(Boolean);
  return rows.map((row) => {
    const [name, ...rest] = row.split(',').map((s) => s.trim());
    return { name, details: [...rest, ...(codes ? [codes] : [])] };
  });
}

export const recallUpc = (rawText: string): string | null => rawText.match(/UPC (\d{12})/)?.[1] ?? null;

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];

/** UPC-A module pattern: 95 bits, 1 is a bar. */
export function upcBits(upc: string): string {
  const d = [...upc].map(Number);
  const left = d.slice(0, 6).map((n) => L[n]).join('');
  const right = d.slice(6).map((n) => [...L[n]].map((b) => (b === '0' ? '1' : '0')).join('')).join('');
  return `101${left}01010${right}101`;
}
