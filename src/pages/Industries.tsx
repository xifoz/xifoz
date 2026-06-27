import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { SectionWrapper } from '@/components/SectionWrapper';
import { IndustryCard } from '@/components/IndustryCard';
import { Button } from '@/components/Button';
import { industries } from '@/data/industries';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

function IndustriesHero() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-dark-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.25} />
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Industries
          </span>
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-dark-text tracking-tight mb-6 transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Industry-specific security solutions
          </h1>
          <p
            className={cn(
              'text-lg md:text-xl text-xifoz-dark-text-muted leading-relaxed transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Every industry faces unique cybersecurity challenges. We tailor our approach to address the specific threats and compliance requirements of your sector.
          </p>
        </div>
      </Container>
    </section>
  );
}

function IndustryDetail({ industry, index }: { industry: typeof industries[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        'py-12 md:py-16 border-b border-xifoz-dark-border last:border-b-0',
        isEven ? 'bg-xifoz-dark-base' : 'bg-xifoz-dark-dim'
      )}
    >
      <Container>
        <div
          className={cn(
            'grid lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          )}
        >
          {/* Image */}
          <div className={cn('rounded-card overflow-hidden', !isEven && 'lg:order-2')}>
            <img
              src={industry.image}
              alt={industry.title}
              width={700}
              height={394}
              className="w-full aspect-video object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Content */}
          <div className={!isEven ? 'lg:order-1' : ''}>
            <h2 className="text-2xl md:text-3xl font-normal text-xifoz-dark-text tracking-tight mb-4">
              {industry.title}
            </h2>
            <p className="text-base text-xifoz-dark-text-muted leading-relaxed mb-8">
              {industry.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-dark-text mb-3">
                  Key Challenges
                </h3>
                <ul className="space-y-2">
                  {industry.challenges.map((challenge) => (
                    <li key={challenge} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-xifoz-danger flex-shrink-0" />
                      <span className="text-sm text-xifoz-dark-text-muted">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-dark-text mb-3">
                  Our Solutions
                </h3>
                <ul className="space-y-2">
                  {industry.solutions.map((solution) => (
                    <li key={solution} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-xifoz-success flex-shrink-0" />
                      <span className="text-sm text-xifoz-dark-text-muted">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

function IndustryCardsSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <SectionWrapper background="dim">
      <Container>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {industries.map((industry, index) => (
            <div
              key={industry.id}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
              }}
            >
              <IndustryCard
                title={industry.title}
                description={industry.description}
                image={industry.image}
              />
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default function Industries() {
  useMeta({ title: 'Industries We Serve', description: 'XIFOZ provides specialized cybersecurity solutions for healthcare, finance, technology, government, education, manufacturing, retail, and logistics.', canonical: '/industries' });
  return (
    <>
      <IndustriesHero />
      <IndustryCardsSection />

      {/* Detailed Industry Sections */}
      {industries.map((industry, index) => (
        <IndustryDetail key={industry.id} industry={industry} index={index} />
      ))}

      {/* CTA */}
      <section className="py-20 md:py-28 bg-xifoz-dark-base">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-normal text-xifoz-dark-text tracking-tight mb-4">
              Need a tailored security solution?
            </h2>
            <p className="text-base text-xifoz-dark-text-muted mb-8">
              We customize our services to meet the unique requirements of your industry. Let us discuss your specific needs.
            </p>
            <Button to="/contact" size="lg">
              Book Free Consultation
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
