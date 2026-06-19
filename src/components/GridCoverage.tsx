import { cn } from '@/lib/utils';

interface GridCoverageProps {
  className?: string;
  opacity?: number;
}

export function GridCoverage({ className, opacity = 0.5 }: GridCoverageProps) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      style={{ opacity }}
    >
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        style={{ mixBlendMode: 'multiply' }}
      >
        <defs>
          <g id="grid-lines">
            <line x1="0" y1="0" x2="0" y2="600" />
            <line x1="100" y1="0" x2="100" y2="600" />
            <line x1="200" y1="0" x2="200" y2="600" />
            <line x1="300" y1="0" x2="300" y2="600" />
            <line x1="400" y1="0" x2="400" y2="600" />
            <line x1="500" y1="0" x2="500" y2="600" />
            <line x1="600" y1="0" x2="600" y2="600" />
            <line x1="700" y1="0" x2="700" y2="600" />
            <line x1="800" y1="0" x2="800" y2="600" />
            <line x1="900" y1="0" x2="900" y2="600" />
            <line x1="1000" y1="0" x2="1000" y2="600" />
            <line x1="0" y1="0" x2="1000" y2="0" />
            <line x1="0" y1="100" x2="1000" y2="100" />
            <line x1="0" y1="200" x2="1000" y2="200" />
            <line x1="0" y1="300" x2="1000" y2="300" />
            <line x1="0" y1="400" x2="1000" y2="400" />
            <line x1="0" y1="500" x2="1000" y2="500" />
            <line x1="0" y1="600" x2="1000" y2="600" />
          </g>
        </defs>
        <use href="#grid-lines" transform="matrix(1 0 0 1 0 0)" opacity="0.08" stroke="#111827" strokeWidth="1" />
        <use href="#grid-lines" transform="matrix(0.860541 0 0 0.860541 69.8418 41.8625)" opacity="0.15" stroke="#2563EB" strokeWidth="1.2" />
        <use href="#grid-lines" transform="matrix(0.740531 0 0 0.740531 129.797 77.6062)" opacity="0.2" stroke="#38BDF8" strokeWidth="1.5" />
        <use href="#grid-lines" transform="matrix(0.63721 0 0 0.63721 181.436 133.837)" opacity="0.25" stroke="#111827" strokeWidth="2" />
        <use href="#grid-lines" transform="matrix(0.548311 0 0 0.548311 225.873 182.507)" opacity="0.35" stroke="#2563EB" strokeWidth="2.5" />
        <use href="#grid-lines" transform="matrix(0.471868 0 0 0.471868 264.098 257.562)" opacity="0.45" stroke="#38BDF8" strokeWidth="3" />
        <use href="#grid-lines" transform="matrix(0.406101 0 0 0.406101 295.978 296.283)" opacity="0.6" stroke="#111827" strokeWidth="4" />
        <use href="#grid-lines" transform="matrix(0.349525 0 0 0.349525 322.28 362.142)" opacity="0.8" stroke="#2563EB" strokeWidth="5" />
        <use href="#grid-lines" transform="matrix(0.30088 0 0 0.30088 344.593 400.758)" opacity="1" stroke="#38BDF8" strokeWidth="6" />
      </svg>
    </div>
  );
}
