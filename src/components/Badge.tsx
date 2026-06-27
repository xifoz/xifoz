import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'cyan';
  className?: string;
}

export function Badge({ children, variant = 'secondary', className }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-xifoz-blue/20 text-xifoz-blue border border-xifoz-blue/30',
    secondary: 'bg-xifoz-dark-dim text-xifoz-dark-text-muted border border-xifoz-dark-border',
    outline: 'border border-xifoz-dark-border text-xifoz-dark-text-muted',
    cyan: 'bg-xifoz-cyan/20 text-xifoz-cyan border border-xifoz-cyan/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-sm uppercase tracking-widest',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
