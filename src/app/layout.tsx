import type { Metadata } from 'next';
import { IBM_Plex_Mono, Schibsted_Grotesk } from 'next/font/google';
import { ensureDemoFresh } from '@/agent/demo';
import { ChatDock } from '@/components/ChatDock';
import { Header } from '@/components/Header';
import { getMeta } from '@/lib/db';
import { formatTime, initials } from '@/lib/format';
import { getProfile, latestRun } from '@/lib/store';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = { title: 'Peachtree', description: 'A compliance radar for Atlanta restaurants and food trucks.' };
export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureDemoFresh();
  const run = latestRun();
  const name = getProfile()?.businessName ?? 'Peachtree';
  const at = run?.finishedAt ?? run?.startedAt;
  const today = at?.slice(0, 10) === new Date().toISOString().slice(0, 10);
  const checked = at ? `${today ? 'Checked today' : 'Last checked'}, ${formatTime(at)}` : 'Not checked yet';
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
