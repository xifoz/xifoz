import { cn } from '@/lib/utils';

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  className?: string;
}

export function ProcessStep({ number, title, description, className }: ProcessStepProps) {
  return (
    <div className={cn('relative pl-8 md:pl-12', className)}>
      <div className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-xifoz-text text-white text-xs md:text-sm font-semibold">
        {number}
      </div>
      <h3 className="text-lg md:text-xl font-semibold text-xifoz-text mb-2">{title}</h3>
      <p className="text-sm md:text-base text-xifoz-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
