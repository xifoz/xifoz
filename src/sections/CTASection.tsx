import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { GridCoverage } from '@/components/GridCoverage';

export function CTASection() {
  return (
    <section className="relative py-20 md:py-28 bg-xifoz-base overflow-hidden">
      <GridCoverage className="absolute inset-0" opacity={0.2} />
      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-text tracking-tight mb-4">
            Protect your business today
          </h2>
          <p className="text-base md:text-lg text-xifoz-text-secondary mb-8">
            Join organizations that trust XIFOZ for their cybersecurity needs. Book a free consultation to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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
