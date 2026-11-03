import type { Source } from './types';

export const SOURCE_LABELS: Record<Source, string> = {
  openfda: 'openFDA',
  'fda-rss': 'FDA recalls',
  'atlanta-council': 'Atlanta City Council',
  'atlanta-notices': 'City of Atlanta',
  'county-health': 'County Board of Health',
};

export const SOURCE_TAGS: Record<Source, string> = {
  openfda: 'FDA · Enforcement',
  'fda-rss': 'FDA · Recall',
  'atlanta-council': 'City council',
  'atlanta-notices': 'City of Atlanta',
  'county-health': 'Board of Health',
};

const TZ = 'America/New_York';

export function formatDate(iso: string): string {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}
