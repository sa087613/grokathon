import type { Source } from './types';

export const SOURCE_LABELS: Record<Source, string> = {
  openfda: 'openFDA',
  'fda-rss': 'FDA recalls',
  'atlanta-council': 'Atlanta City Council',
  'atlanta-notices': 'City of Atlanta',
  'county-health': 'County Board of Health',
};

const TZ = 'America/New_York';

export function formatDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: TZ });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
}
