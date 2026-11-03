import type { Item } from '@/lib/types';

export const item = (over: Partial<Item> = {}): Item => ({
  id: 'x:1', source: 'atlanta-notices', title: 'Test item', url: 'https://example.com', publishedAt: '2026-11-01', rawText: 'body', ...over,
});
