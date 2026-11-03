const DIM = 512;
const STOP = new Set('the a an and or of to in on for with by at from is are be this that it as was will has have not all any its'.split(' '));

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Local hashed bag of words and bigrams, so similarity works with zero keys. */
export function hashEmbed(text: string): number[] {
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => !STOP.has(t) && t.length > 1) ?? [];
  const v = new Array<number>(DIM).fill(0);
  tokens.forEach((t, i) => {
    v[hash(t) % DIM] += 1;
    if (i > 0) v[hash(`${tokens[i - 1]} ${t}`) % DIM] += 1;
  });
  const norm = Math.hypot(...v) || 1;
  return v.map((x) => x / norm);
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
