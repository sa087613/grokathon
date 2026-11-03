import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = { title: 'Peachtree', description: 'A compliance radar for Atlanta restaurants and food trucks.' };

const NAV = [['/', 'Overview'], ['/rejected', 'Rejected'], ['/profile', 'Store'], ['/about', 'About']];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <header className="flex flex-wrap items-baseline justify-between gap-3 py-8">
            <Link href="/" className="font-serif text-xl">Peachtree<span className="text-peach">.</span></Link>
            <nav className="flex gap-5 text-sm text-muted">
              {NAV.map(([href, label]) => <Link key={href} href={href} className="hover:text-ink">{label}</Link>)}
            </nav>
          </header>
          <main className="pb-24">{children}</main>
        </div>
      </body>
    </html>
  );
}
