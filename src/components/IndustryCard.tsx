import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndustryCardProps {
  title: string;
  description: string;
  image: string;
  className?: string;
}

export function IndustryCard({ title, description, image, className }: IndustryCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-card bg-xifoz-dark-surface border border-xifoz-dark-border transition-all duration-300 hover:-translate-y-1 hover:border-xifoz-dark-text/20',
        className
      )}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          width={400}
          height={250}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-xifoz-dark-text mb-1">{title}</h3>
            <p className="text-sm text-xifoz-dark-text-muted leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
          <Link
            to="/industries"
            className="mt-1 p-2 rounded-full bg-xifoz-dark-dim text-xifoz-dark-text-muted hover:bg-xifoz-blue hover:text-white transition-colors duration-300 flex-shrink-0"
            aria-label={`Learn more about ${title} security`}
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
