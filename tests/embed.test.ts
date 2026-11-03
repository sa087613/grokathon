import { describe, expect, it } from 'vitest';
import { cosine, hashEmbed } from '@/lib/embed';
import { parseJson } from '@/lib/llm';

describe('embeddings and parsing', () => {
  it('ranks related text higher', () => {
    const a = hashEmbed('Moreland Ave milling project');
    expect(cosine(a, hashEmbed('Moreland Ave milling project phase two'))).toBeGreaterThan(cosine(a, hashEmbed('proclamation for debate team')));
  });
  it('treats mismatched dimensions as unrelated', () => {
    expect(cosine([1], [1, 0])).toBe(0);
  });
  it('extracts JSON from wrapped model output', () => {
    expect(parseJson('Sure:\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJson('no json')).toBeNull();
  });
});
