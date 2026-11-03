import type { ItemView } from '@/lib/types';

export function plainBrief(v: ItemView): string {
  const d = v.decision;
  return [
    v.title,
    '',
    `Why it matters: ${d.reason}`,
    d.suggestedAction ? `Suggested action: ${d.suggestedAction}` : '',
    d.deadline ? `Deadline: ${d.deadline}` : '',
    `Source: ${v.url}`,
    '',
    'Sent from Comply.',
  ].filter((l, i) => l !== '' || i === 1 || i === 6).join('\n');
}

export function mailtoHref(v: ItemView): string {
  return `mailto:?subject=${encodeURIComponent(`Comply brief: ${v.title}`)}&body=${encodeURIComponent(plainBrief(v))}`;
}
