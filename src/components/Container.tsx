import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'content' | 'reading';
}

export function Container({ children, className, variant = 'content' }: ContainerProps) {
  const variantClasses = {
    content: 'container-xifoz',
    reading: 'container-reading',
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      {children}
    </div>
  );
}
