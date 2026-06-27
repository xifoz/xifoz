import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Shield, Target, Award, ScanSearch } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Trust Before Revenue',
    description: 'We build lasting relationships through integrity and reliability.',
  },
  {
    icon: Shield,
    title: 'Prevention Before Recovery',
    description: 'We focus on stopping threats before they impact your business.',
  },
  {
    icon: Award,
    title: 'Excellence Without Compromise',
    description: 'We deliver the highest quality in everything we do.',
  },
  {
    icon: ScanSearch,
    title: 'Transparency by Default',
    description: 'Clear communication. No jargon. No hidden agendas.',
  },
  {
    icon: Target,
    title: 'Continuous Improvement',
    description: 'We evolve with emerging threats to keep you always protected.',
  },
];

export function WhyChooseSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <SectionWrapper background="base">
      <Container>
          <div ref={ref} className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-12 w-full">
            {reasons.map((reason, index) => (
              <div
                key={reason.title}
                className="group bg-white border border-xifoz-border rounded-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full flex flex-col"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
                }}
              >
                <div className="w-10 h-10 mb-4 transition-colors duration-300">
                  <reason.icon size={24} className="text-xifoz-accent" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-xifoz-text mb-2">{reason.title}</h3>
                <p className="text-sm text-xifoz-text-secondary leading-relaxed flex-grow">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
      </Container>
    </SectionWrapper>
  );
}
