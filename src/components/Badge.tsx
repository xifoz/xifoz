import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'cyan';
  className?: string;
}

export function Badge({ children, variant = 'secondary', className }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-xifoz-blue text-white',
    secondary: 'bg-xifoz-dim text-xifoz-text-secondary',
    outline: 'border border-xifoz-text/20 text-xifoz-text-secondary',
    cyan: 'bg-cyan-50 text-cyan-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium rounded-badge uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
