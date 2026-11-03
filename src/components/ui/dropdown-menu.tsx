'use client';

import * as Menu from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = Menu.Root;
export const DropdownMenuTrigger = Menu.Trigger;

export function DropdownMenuContent({ className, ...props }: Menu.DropdownMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Content sideOffset={6} align="start" className={cn('z-[1000] min-w-52 border border-ink bg-paper py-1', className)} {...props} />
    </Menu.Portal>
  );
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, Menu.DropdownMenuItemProps>(({ className, ...props }, ref) => (
  <Menu.Item ref={ref} className={cn('flex cursor-pointer items-center justify-between gap-6 px-3 py-2 text-sm outline-none data-[highlighted]:bg-panel', className)} {...props} />
));
DropdownMenuItem.displayName = 'DropdownMenuItem';
