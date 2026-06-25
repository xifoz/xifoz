import { lazy, Suspense, useEffect, useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { GridCoverage } from '@/components/GridCoverage';

const DigitalArmorSphere = lazy(() =>
  import('@/components/DigitalArmorSphere').then((mod) => ({
    default: mod.DigitalArmorSphere,
  }))
);

export function HeroSection() {
  const [showSphere, setShowSphere] = useState(false);

  useEffect(() => {
    const load = () => setShowSphere(true);
    if ('requestIdleCallback' in window) {
      (window as Window & typeof globalThis & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(load);
    } else {
      setTimeout(load, 1200);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-xifoz-base">
      {/* Background grid */}
      <GridCoverage className="absolute inset-0" opacity={0.3} />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-xifoz-base via-xifoz-base/90 to-transparent z-[1]" />

      {/* 3D Sphere */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[60%] h-[80%] z-[2] hidden lg:block">
        {showSphere && (
          <Suspense fallback={null}>
            <DigitalArmorSphere className="w-full h-full" />
          </Suspense>
        )}
      </div>

      {/* Content */}
      <Container className="relative z-[3] pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="opacity-100 translate-y-0 transition-all duration-700 delay-300">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-6 block">
              Enterprise Cybersecurity
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-xifoz-text leading-[1.05] tracking-tight mb-6 opacity-100 translate-y-0 transition-all duration-700 delay-500">
            Do not let anyone breach your{' '}
            <span className="text-gradient">digital infrastructure</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-xifoz-text-secondary leading-relaxed mb-10 max-w-xl opacity-100 translate-y-0 transition-all duration-700 delay-700">
            XIFOZ provides continuous monitoring, proactive threat hunting, and bulletproof cloud
            architecture for scaling teams.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 opacity-100 translate-y-0 transition-all duration-700 delay-900">
            <Button to="/contact" size="lg">
              Book Free Consultation
            </Button>
            <Button to="/services" variant="outline" size="lg">
              Explore Services
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
