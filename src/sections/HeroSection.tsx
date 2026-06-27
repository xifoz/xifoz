import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section ref={ref} className="relative flex min-h-[92vh] items-center overflow-hidden bg-xifoz-dark-base">
      <Container className="py-24 lg:py-32">
        <div className="grid items-center gap-12 xl:gap-16 lg:grid-cols-[46%_54%]">

          {/* LEFT */}

          <div
            className={cn(
              'transition-all duration-1000',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >

            <span className="block text-[12px] font-medium uppercase tracking-[0.35em] text-xifoz-dark-text-muted">
              Enterprise Cybersecurity Consulting
            </span>

            <h1 className="mt-8 text-5xl font-light leading-[0.92] tracking-[-0.05em] text-xifoz-dark-text md:text-6xl xl:text-[78px]">
              We Provide
              <br />
              Enterprise Grade
              <br />
              Security without
              <br />
              Enterprise
              <br />
              Complexity.
            </h1>

            <p className="mt-8 max-w-[560px] text-base md:text-lg leading-7 text-xifoz-dark-text-muted md:text-xl">
              XIFOZ helps organisations strengthen security through
              penetration testing, cloud security, compliance,
              managed security and advisory services—delivering
              enterprise-grade protection without enterprise complexity.
            </p>

            <div className="mt-12 flex flex-wrap gap-4">

              <Button
                to="/contact"
                size="lg"
              >
                Talk to an Expert
              </Button>

              <Button
                to="/services"
                variant="outline"
                size="lg"
              >
                Explore Capabilities
              </Button>

            </div>

          </div>

          {/* RIGHT */}

          <div
            className={cn(
              'flex justify-end transition-all duration-1000 delay-300',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            )}
          >

            <img
              src="/images/hero-architecture.png"
              alt="XIFOZ Enterprise Security"
              className="w-full max-w-[760px] object-cover"
              loading="eager"
            />

          </div>

        </div>
      </Container>
    </section>
  );
}