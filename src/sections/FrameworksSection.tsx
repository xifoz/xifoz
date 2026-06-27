import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const frameworks = [
  'ISO 27001',
  'SOC 2',
  'GDPR',
  'HIPAA',
  'PCI DSS',
  'NIST',
  'CIS Controls',
  'COBIT',
  'FedRAMP',
  'CSA STAR',
];

export function FrameworksSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <SectionWrapper background="dim">
      <Container>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Compliance
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
            Aligned with Leading Security Frameworks
          </h2>
          <p className="text-base text-xifoz-text-secondary max-w-xl mx-auto">
            Our services map to all major compliance standards, helping you meet regulatory requirements with confidence.
          </p>
        </div>

        <div ref={ref} className="flex flex-wrap justify-center gap-3 md:gap-4">
          {frameworks.map((framework, index) => (
            <div
              key={framework}
              className="px-5 py-2.5 bg-white border border-xifoz-border rounded-pill text-sm font-medium text-xifoz-text hover:border-xifoz-border/20 hover:shadow-[0_0_15px_rgba(37,99,235,0.1)] transition-all duration-300 cursor-default"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                transition: `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`,
              }}
            >
              {framework}
            </div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
