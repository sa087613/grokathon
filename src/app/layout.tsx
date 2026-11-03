import type { Metadata } from 'next';
import { ensureDemoFresh } from '@/agent/demo';
import { ChatDock } from '@/components/ChatDock';
import { Header } from '@/components/Header';
import { getMeta } from '@/lib/db';
import { formatTime, initials } from '@/lib/format';
import { getProfile, latestRun } from '@/lib/store';
import '@fontsource-variable/schibsted-grotesk';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata: Metadata = { title: 'Peachtree', description: 'A compliance radar for Atlanta restaurants and food trucks.' };
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureDemoFresh();
  const run = latestRun();
  const name = getProfile()?.businessName ?? 'Peachtree';
  const at = run?.finishedAt ?? run?.startedAt;
  const day = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const today = !!at && day(new Date(at)) === day(new Date());
  const checked = at ? `${today ? 'Checked today' : 'Last checked'}, ${formatTime(at)}` : 'Not checked yet';
  return (
    <html lang="en">
      <body>
        <Header checked={checked} initials={initials(name)} businessName={name} />
        <main className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-8">{children}</main>
        <footer className="border-t border-line px-4 py-6 text-sm text-muted sm:px-8">
          {getMeta('demo_date') ? 'Demo data resets daily. Every firm, recall and ordinance shown is invented, and your overturns, resolves and profile edits are cleared.' : 'Peachtree can miss things. It does not replace your own deadlines or your county inspector.'}
        </footer>
        <ChatDock />
      </body>
    </html>
  );
}
