import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { ServiceCard } from '@/components/ServiceCard';
import { services } from '@/data/services';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CoverageGrid() {
  const featuredServices = services.slice(0, 6);

  return (
    <SectionWrapper background="dim" id="services">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-dark-text tracking-tight mb-4">
            Comprehensive Coverage
          </h2>
          <p className="text-base md:text-lg text-xifoz-dark-text-muted max-w-2xl mx-auto">
            End-to-end cybersecurity services designed to protect every layer of your digital infrastructure.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {featuredServices.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-xifoz-blue hover:gap-3 transition-all duration-300"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  );
}
