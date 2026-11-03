import type { Item, Topic } from './types';

export function classify(item: Pick<Item, 'source' | 'title' | 'rawText'>): { topic: Topic; classLabel: string } {
  const text = `${item.title} ${item.rawText}`;
  switch (item.source) {
    case 'openfda':
      return { topic: 'food_recalls', classLabel: text.match(/Class I{1,3}\b/)?.[0] ?? 'Recall' };
    case 'fda-rss':
      return { topic: 'food_recalls', classLabel: 'Recall notice' };
    case 'atlanta-council':
      return { topic: 'council_routine', classLabel: /ordinance/i.test(item.title) ? 'Ordinance' : /resolution/i.test(item.title) ? 'Resolution' : 'Agenda item' };
    case 'county-health':
      return /\bfees?\b/i.test(item.title)
        ? { topic: 'permits_fees', classLabel: 'Fee change' }
        : { topic: 'health_code', classLabel: 'Rule change' };
    case 'atlanta-notices':
      return /closure|lane|paving|milling|water main|detour/i.test(item.title)
        ? { topic: 'street_work', classLabel: 'Street work' }
        : { topic: 'permits_fees', classLabel: 'Permit notice' };
  }
}
