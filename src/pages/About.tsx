import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { SectionWrapper } from '@/components/SectionWrapper';
import { Button } from '@/components/Button';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { Target, Eye, Heart, Shield, Lightbulb, Users } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description: 'We believe security should be the foundation of every technology decision, not an afterthought.',
  },
  {
    icon: Lightbulb,
    title: 'Continuous Innovation',
    description: 'The threat landscape evolves constantly. We stay ahead through continuous learning and innovation.',
  },
  {
    icon: Heart,
    title: 'Client Partnership',
    description: 'We do not just deliver services — we build lasting partnerships based on trust and mutual success.',
  },
  {
    icon: Users,
    title: 'Diverse Expertise',
    description: 'Our team brings together specialists from across cybersecurity, ensuring comprehensive coverage.',
  },
];

const timeline = [
  {
    year: '2026 Q1',
    title: 'Company Founded',
    description: 'XIFOZ was established with a mission to deliver enterprise-grade cybersecurity consulting to modern organizations.',
  },
  {
    year: '2026 Q2',
    title: 'Brand & Identity',
    description: 'Developed the XIFOZ brand identity, service catalogue, and operational frameworks. Secured initial consulting engagements.',
  },
  {
    year: '2026 Q3',
    title: 'Website & Go-to-Market',
    description: 'Launched the XIFOZ website and public-facing presence. Defined core service lines: penetration testing, managed security, and compliance consulting.',
  },
  {
    year: '2026 Q4',
    title: 'First Client Partnerships',
    description: 'Onboarded founding client partners. Delivered initial security assessments and established repeatable delivery processes.',
  },
  {
    year: '2027',
    title: 'Expanding Capabilities',
    description: 'Building out SOC-as-a-Service capabilities and formalizing enterprise consulting workflows. Deepening long-term client partnerships.',
  },
  {
    year: '2028',
    title: 'AI & Cloud Focus',
    description: 'Expanding into AI-assisted threat detection and cloud modernization security. Growing the technical team and broadening service depth.',
  },
];

function AboutHero() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.25} />
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            About Us
          </span>
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6 transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            XIFOZ - Your Digital Guardian
          </h1>
          <p
            className={cn(
              'text-lg md:text-xl text-xifoz-text-secondary leading-relaxed transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            XIFOZ was founded in 2026 with a singular purpose: to make world-class cybersecurity
            accessible to every organization. Inspired by the Greek word &ldquo;Xiphos&rdquo; (sword), we
            represent precision, intelligence, and unwavering defense.
          </p>
        </div>
      </Container>
    </section>
  );
}

function ValuesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <SectionWrapper background="base">
      <Container>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Our Values
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight">
            Principles that guide everything we do
          </h2>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="bg-white border border-xifoz-border rounded-card p-6 md:p-8"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-xifoz-dim flex items-center justify-center mb-4">
                <value.icon size={20} className="text-xifoz-accent" />
              </div>
              <h3 className="text-base font-semibold text-xifoz-text mb-2">{value.title}</h3>
              <p className="text-sm text-xifoz-text-secondary leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}

function TimelineSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <SectionWrapper background="dim">
      <Container>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Our Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight">
            Milestones along the way
          </h2>
        </div>
        <div ref={ref} className="max-w-3xl mx-auto">
          {timeline.map((item, index) => (
            <div
              key={item.year}
              className="relative pl-8 md:pl-12 pb-10 last:pb-0"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
              }}
            >
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-xifoz-dim border-2 border-xifoz-border flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-xifoz-text" />
              </div>
              {index < timeline.length - 1 && (
                <div className="absolute left-[11px] top-6 w-0.5 h-full bg-xifoz-border" />
              )}
              <span className="text-xs font-semibold text-xifoz-accent mb-1 block">{item.year}</span>
              <h3 className="text-lg font-semibold text-xifoz-text mb-1">{item.title}</h3>
              <p className="text-sm text-xifoz-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default function About() {
  useMeta({ title: 'About Us', description: 'Learn about XIFOZ — founded in 2026 with a mission to make enterprise-grade cybersecurity accessible to every organization.', canonical: '/about' });
  return (
    <>
      <AboutHero />

      {/* Mission & Vision */}
      <SectionWrapper background="dim">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-xifoz-dim flex items-center justify-center">
                  <Target size={20} className="text-xifoz-accent" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent">
                  Mission
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-normal text-xifoz-text tracking-tight mb-4">
                Protect organizations from modern cyber threats
              </h2>
              <p className="text-base text-xifoz-text-secondary leading-relaxed">
                Through proactive cybersecurity services, intelligent security strategies, and
                enterprise-grade protection, we help organizations stay resilient in an
                ever-evolving threat landscape.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-xifoz-dim flex items-center justify-center">
                  <Eye size={20} className="text-xifoz-accent" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent">
                  Vision
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-normal text-xifoz-text tracking-tight mb-4">
                A world where every organization is cyber-resilient
              </h2>
              <p className="text-base text-xifoz-text-secondary leading-relaxed">
                We envision a future where robust cybersecurity is not a privilege but a standard —
                where businesses of all sizes can operate with confidence, knowing their digital
                assets are protected.
              </p>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      <ValuesSection />
      <TimelineSection />

      {/* CTA */}
      <section className="py-20 md:py-28 bg-xifoz-base">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
              Be part of our story
            </h2>
            <p className="text-base text-xifoz-text-secondary mb-8">
              We are at the start of our journey and looking for organizations who want a true
              security partner — not just a vendor.
            </p>
            <Button to="/contact" size="lg">
              Work With Us
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
