import fs from 'node:fs';
import { fixturePath, readFixture } from '@/ingest/fixtures';

export type JobKind = 'street' | 'repaving' | 'nodig' | 'building';
export const JOB_LABELS: Record<JobKind, string> = { street: 'Street work', repaving: 'Repaving', nodig: 'No-dig', building: 'Building' };

export interface StreetJob {
  id: number;
  kind: JobKind;
  street: string;
  detail: string;
  lat: number;
  lng: number;
  validThrough: string;
}

/** Krog Street and Edgewood Ave, the demo truck's base. */
export const DEMO_BASE = { lat: 33.7545, lng: -84.3645 };
const NEAR_METERS = 400;

export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(h));
}

export function demoJobs(): StreetJob[] {
  return fs.existsSync(fixturePath('street-jobs.json')) ? JSON.parse(readFixture('street-jobs.json')) : [];
}

export function summarizeJobs(jobs: StreetJob[], base = DEMO_BASE) {
  const ranked = jobs.map((j) => ({ ...j, meters: Math.round(metersBetween(base, j)) })).sort((a, b) => a.meters - b.meters);
  const works = ranked.filter((j) => j.kind !== 'building');
  const nearest = works[0] ?? null;
  return {
    nearest,
    nearbyStreets: new Set(works.filter((j) => j.meters <= NEAR_METERS).map((j) => j.street)).size,
    jobsOnNearest: nearest ? jobs.filter((j) => j.street === nearest.street).length : 0,
    counts: (Object.keys(JOB_LABELS) as JobKind[]).map((k) => ({ kind: k, count: jobs.filter((j) => j.kind === k).length })),
  };
}
