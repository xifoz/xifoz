import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto max-w-content px-4 sm:px-6 lg:px-8 xl:px-12', className)}>
      {children}
    </div>
  );
}
