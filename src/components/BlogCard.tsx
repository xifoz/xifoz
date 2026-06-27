import { cn } from '@/lib/utils';
import { Badge } from './Badge';
import { Link } from 'react-router-dom';

interface BlogCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readingTime: string;
  image: string;
  slug: string;
  className?: string;
  featured?: boolean;
}

export function BlogCard({
  title,
  excerpt,
  category,
  date,
  readingTime,
  image,
  slug,
  className,
  featured = false,
}: BlogCardProps) {
  return (
    <div
      className={cn(
        'group cursor-pointer blog-card-hover',
        featured ? 'md:col-span-2 md:row-span-2' : '',
        className
      )}
    >
      <Link to={`/blog/${slug}`} className="block">
        <div
          className={cn(
            'relative overflow-hidden rounded-card mb-4',
            featured ? 'aspect-[16/9]' : 'aspect-[16/10]'
          )}
        >
          <img
            src={image}
            alt={title}
            width={featured ? 800 : 400}
            height={featured ? 450 : 250}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge variant="cyan">{category}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs text-xifoz-dark-text-muted">
            <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>&middot;</span>
            <span>{readingTime}</span>
          </div>
          <h3
            className={cn(
              'font-medium text-xifoz-dark-text leading-snug group-hover:text-xifoz-blue transition-colors duration-300',
              featured ? 'text-xl md:text-2xl' : 'text-base'
            )}
          >
            {title}
          </h3>
          {!featured && (
            <p className="text-sm text-xifoz-dark-text-muted leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
