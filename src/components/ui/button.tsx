import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 text-sm disabled:opacity-50', {
  variants: {
    variant: {
      solid: 'bg-ink px-4 py-2 text-paper hover:bg-accent',
      outline: 'border border-ink px-4 py-2 hover:bg-raise',
      ghost: 'px-2 py-1.5 text-ink/75 hover:bg-link-soft hover:text-link',
      icon: 'h-11 w-11 border border-ink hover:bg-raise',
    },
  },
  defaultVariants: { variant: 'solid' },
});

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(({ className, variant, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant }), className)} {...props} />;
});
Button.displayName = 'Button';
