import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Shield, Clock, Users, Target, Zap, Award } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Proactive Defense',
    description: 'We identify and neutralize threats before they become breaches, not after.',
  },
  {
    icon: Clock,
    title: '24/7 Monitoring',
    description: 'Round-the-clock security operations ensuring continuous protection.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Certified security professionals with deep industry experience.',
  },
  {
    icon: Target,
    title: 'Tailored Solutions',
    description: 'Security strategies customized to your specific business needs.',
  },
  {
    icon: Zap,
    title: 'Rapid Response',
    description: 'Swift incident response to minimize impact and recovery time.',
  },
  {
    icon: Award,
    title: 'Compliance Ready',
    description: 'Meet regulatory requirements with confidence and documentation.',
  },
];

export function WhyChooseSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <SectionWrapper background="base">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left - Sticky header */}
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
              Why XIFOZ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-dark-text tracking-tight mb-6">
              Why organizations trust us with their security?
            </h2>
            <p className="text-base md:text-lg text-xifoz-dark-text-muted leading-relaxed">
              We combine technical expertise with business understanding to deliver security solutions that protect without hindering growth.
            </p>
          </div>

          {/* Right - Reasons grid */}
          <div ref={ref} className="grid sm:grid-cols-2 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={reason.title}
                className="group"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-xifoz-blue/10 flex items-center justify-center mb-3 group-hover:bg-xifoz-blue/20 transition-colors duration-300">
                  <reason.icon size={20} className="text-xifoz-blue" />
                </div>
                <h3 className="text-base font-semibold text-xifoz-dark-text mb-1">{reason.title}</h3>
                <p className="text-sm text-xifoz-dark-text-muted leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
