'use client';

import { ChevronDown, ListFilter } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export interface MenuLink {
  href: string;
  label: string;
  count?: number;
}

function Items({ links }: { links: MenuLink[] }) {
  return (
    <DropdownMenuContent>
      {links.map((l) => (
        <DropdownMenuItem key={l.href} asChild>
          <Link href={l.href}>{l.label}{l.count !== undefined && <span className="font-mono text-xs text-muted">{l.count}</span>}</Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

export function TextMenu({ label, links, className }: { label: string; links: MenuLink[]; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>{label}<ChevronDown className="h-3.5 w-3.5" /></DropdownMenuTrigger>
      <Items links={links} />
    </DropdownMenu>
  );
}

export function FilterMenu({ links }: { links: MenuLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="icon" aria-label="Filter by topic"><ListFilter className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <Items links={links} />
    </DropdownMenu>
  );
}
