import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('label inline-flex items-center gap-1.5 border px-2.5 py-1', {
  variants: {
    variant: {
      urgent: 'border-brick bg-brick text-paper',
      solid: 'border-ink bg-ink text-paper',
      outline: 'border-line-strong text-ink/80',
    },
  },
  defaultVariants: { variant: 'outline' },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
