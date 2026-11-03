import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = fs.readFileSync('src/app/globals.css', 'utf8');
const rgb = (name: string) => css.match(new RegExp(`--${name}: (\\d+) (\\d+) (\\d+);`))!.slice(1, 4).map(Number);
const lum = (c: number[]) => {
  const [r, g, b] = c.map((x) => { const s = x / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** Text at partial opacity, as in text-ink/75. */
const mix = (fg: number[], bg: number[], a: number) => fg.map((x, i) => x * a + bg[i] * (1 - a));

const BACKGROUNDS = ['paper', 'panel', 'raise'];

describe('WCAG AA contrast', () => {
  for (const bg of BACKGROUNDS) {
    for (const fg of ['ink', 'muted', 'coral', 'link', 'peach']) {
      it(`${fg} on ${bg}`, () => expect(ratio(rgb(fg), rgb(bg))).toBeGreaterThanOrEqual(4.5));
    }
    it(`70% ink on ${bg}`, () => expect(ratio(mix(rgb('ink'), rgb(bg), 0.7), rgb(bg))).toBeGreaterThanOrEqual(4.5));
  }
  it.each([
    ['coral', 'coral-soft'], ['paper', 'coral'], ['paper', 'ink'], ['paper', 'peach'], ['ink', 'line'], ['link', 'link-soft'],
  ])('%s on %s', (fg, bg) => expect(ratio(rgb(fg), rgb(bg))).toBeGreaterThanOrEqual(4.5));
});
