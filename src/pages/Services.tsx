import { Container } from '@/components/Container';
import { useMeta } from '@/hooks/useMeta';
import { SectionWrapper } from '@/components/SectionWrapper';
import { ServiceCard } from '@/components/ServiceCard';
import { FAQSection } from '@/components/FAQSection';
import { Button } from '@/components/Button';
import { services } from '@/data/services';
import { servicesFAQ } from '@/data/faq';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import {
  Sword,
  ScanSearch,
  ShieldCheck,
  MonitorCheck,
  CloudCog,
  GlobeLock,
  Webhook,
  Network,
  Siren,
  FileCheck,
  ClipboardCheck,
  Users,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sword, ScanSearch, ShieldCheck, MonitorCheck, CloudCog, GlobeLock,
  Webhook, Network, Siren, FileCheck, ClipboardCheck, Users,
};

function ServicesHero() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-xifoz-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.25} />
      <Container className="relative z-10">
        <div className="max-w-3xl">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Services
          </span>
          <h1
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-normal text-xifoz-text tracking-tight mb-6 transition-all duration-700 delay-100',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            Cybersecurity services built for modern organizations
          </h1>
          <p
            className={cn(
              'text-lg md:text-xl text-xifoz-text-secondary leading-relaxed transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            From proactive testing to continuous monitoring, we provide comprehensive protection across your entire digital infrastructure.
          </p>
        </div>
      </Container>
    </section>
  );
}

function ServiceDetail({ service, index }: { service: typeof services[0]; index: number }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const IconComponent = iconMap[service.icon] || ShieldCheck;
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={cn(
        'py-12 md:py-16 border-b border-xifoz-text/5 last:border-b-0',
        isEven ? 'bg-xifoz-base' : 'bg-xifoz-dim'
      )}
    >
      <Container>
        <div
          className={cn(
            'grid lg:grid-cols-2 gap-8 lg:gap-16 items-start transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          )}
        >
          {/* Left - Info */}
          <div>
            <div className="w-12 h-12 rounded-lg bg-xifoz-blue/5 flex items-center justify-center mb-5">
              <IconComponent size={24} className="text-xifoz-blue" />
            </div>
            <h2 className="text-2xl md:text-3xl font-normal text-xifoz-text tracking-tight mb-4">
              {service.title}
            </h2>
            <p className="text-base text-xifoz-text-secondary leading-relaxed mb-6">
              {service.description}
            </p>
            <Button to="/contact" size="sm">
              Get Started
            </Button>
          </div>

          {/* Right - Features & Ideal For */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-text mb-4">
                What is included
              </h3>
              <ul className="space-y-2.5">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-xifoz-blue flex-shrink-0" />
                    <span className="text-sm text-xifoz-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-xifoz-text mb-3">
                Ideal for
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.idealFor.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-xifoz-surface border border-xifoz-text/5 rounded-pill text-xs text-xifoz-text-secondary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function Services() {
  useMeta({ title: 'Our Services', description: "Explore XIFOZ cybersecurity services: penetration testing, vulnerability assessment, SOC-as-a-Service, incident response, cloud security, and compliance consulting.", canonical: '/services' });
  return (
    <>
      <ServicesHero />

      {/* Service Cards Overview */}
      <SectionWrapper background="dim" padding="normal">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                icon={service.icon}
                compact
              />
            ))}
          </div>
        </Container>
      </SectionWrapper>

      {/* Detailed Service Sections */}
      {services.map((service, index) => (
        <ServiceDetail key={service.id} service={service} index={index} />
      ))}

      {/* FAQ */}
      <SectionWrapper background="dim">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
                Service FAQs
              </h2>
              <p className="text-base text-xifoz-text-secondary">
                Common questions about our cybersecurity services.
              </p>
            </div>
            <FAQSection items={servicesFAQ} />
          </div>
        </Container>
      </SectionWrapper>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-xifoz-base">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
              Not sure which service you need?
            </h2>
            <p className="text-base text-xifoz-text-secondary mb-8">
              Our team will assess your requirements and recommend the right security solutions for your organization.
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
