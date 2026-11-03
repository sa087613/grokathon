'use client';

import { useEffect, useRef } from 'react';
import type { JobKind, StreetJob } from '@/lib/streetJobs';

const COLORS: Record<JobKind, string> = { street: '#E5645A', repaving: '#E0A84A', nodig: '#7AA7FF', building: '#9B958A' };

export function StreetMap({ jobs, base }: { jobs: StreetJob[]; base: { lat: number; lng: number } }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | undefined;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      (window as unknown as { L: typeof L }).L = L; // The cluster plugin attaches itself to the global.
      await import('leaflet.markercluster');
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([base.lat + 0.022, base.lng - 0.024], 12);
      // CARTO Dark Matter needs a key. Without one, OpenStreetMap tiles are darkened in CSS.
      const key = process.env.NEXT_PUBLIC_CARTO_API_KEY;
      // Offline, skip tiles: the plain background and markers still render, with no failed requests.
      if (!navigator.onLine) {
        // No tile layer.
      } else if (key) {
        L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${key}`, { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
      } else {
        el.current.classList.add('osm-dark');
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
      }
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 34,
        iconCreateFunction: (c) => L.divIcon({ className: 'job-cluster', html: String(c.getChildCount()), iconSize: [24, 24] }),
      });
      for (const j of jobs) {
        const icon = L.divIcon({ className: '', html: `<span style="display:block;width:10px;height:10px;background:${COLORS[j.kind]};border:1px solid #121110"></span>`, iconSize: [10, 10] });
        cluster.addLayer(L.marker([j.lat, j.lng], { icon, title: `${j.street}: ${j.detail}` }));
      }
      map.addLayer(cluster);
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [jobs, base]);

  return <div ref={el} className="z-0 h-56 w-full border border-line-strong" role="img" aria-label="Map of street work near your base" />;
}
