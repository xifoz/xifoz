import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'base' | 'surface' | 'dim' | 'structural';
  padding?: 'normal' | 'large' | 'none';
}

export function SectionWrapper({
  children,
  className,
  id,
  background = 'base',
  padding = 'normal',
}: SectionWrapperProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  const bgClasses = {
    base: 'bg-xifoz-base',
    surface: 'bg-xifoz-surface',
    dim: 'bg-xifoz-dim',
    structural: 'bg-xifoz-structural',
  };

  const paddingClasses = {
    normal: 'py-16 md:py-24',
    large: 'py-24 md:py-32',
    none: '',
  };

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        bgClasses[background],
        paddingClasses[padding],
        'transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className
      )}
    >
      {children}
    </section>
  );
}
