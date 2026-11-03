'use client';

import { CircleHelp, FileText, LayoutGrid, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logomark } from './Logomark';

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/profile', label: 'Store profile', icon: Settings },
  { href: '/about', label: 'About', icon: FileText },
];

export function Header({ checked, initials, businessName }: { checked: string; initials: string; businessName: string }) {
  const path = usePathname();
  const active = (href: string) => (href === '/' ? path === '/' || path === '/rejected' || path === '/ask' : path === href);
  return (
    <header className="sticky top-0 z-[900] grid grid-cols-[1fr_auto] items-center border-b-2 border-ink bg-paper px-4 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
      <Link href="/" aria-label="Comply overview" className="flex h-14 items-center gap-2 lg:h-20">
        <Logomark className="h-8 w-8 text-accent" />
        <span className="font-bold tracking-tight">Comply</span>
      </Link>
      <div className="flex items-center justify-end gap-3 lg:order-3">
        <span className="label hidden text-muted xl:inline">{checked}</span>
        <CircleHelp className="hidden h-4 w-4 text-muted xl:block" aria-label="Comply checks your sources each morning" />
        <span title={businessName} className="flex h-10 w-10 items-center justify-center rounded-full bg-line text-sm font-bold">{initials}</span>
      </div>
      <nav className="col-span-2 -mb-[3px] flex justify-between gap-2 sm:justify-center sm:gap-8 lg:col-span-1 lg:order-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}
            className={cn('flex items-center gap-2 border-b-[6px] py-3 text-sm lg:py-6', active(href) ? 'border-accent font-semibold' : 'border-transparent text-ink/70 hover:text-ink')}>
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
