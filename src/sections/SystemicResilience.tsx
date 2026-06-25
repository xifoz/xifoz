import { Container } from '@/components/Container';
import { GridCoverage } from '@/components/GridCoverage';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { ShieldCheck, Zap, RefreshCw, Lock } from 'lucide-react';

const metrics = [
  {
    icon: ShieldCheck,
    value: '< 15 min',
    label: 'Mean Time to Detect',
    description: 'Threats identified and triaged',
    accent: 'text-xifoz-cyan',
    bg: 'bg-xifoz-cyan/10',
  },
  {
    icon: Zap,
    value: '99.97%',
    label: 'Uptime SLA',
    description: 'Security monitoring availability',
    accent: 'text-xifoz-blue',
    bg: 'bg-xifoz-blue/10',
  },
  {
    icon: RefreshCw,
    value: 'Continuous',
    label: 'Compliance Checks',
    description: 'Automated policy validation',
    accent: 'text-xifoz-cyan',
    bg: 'bg-xifoz-cyan/10',
  },
  {
    icon: Lock,
    value: 'Zero Trust',
    label: 'Access Model',
    description: 'Every request verified explicitly',
    accent: 'text-xifoz-blue',
    bg: 'bg-xifoz-blue/10',
  },
];

const pillars = [
  'Automated threat detection and response',
  'Infrastructure as code security controls',
  'Self-healing security architecture',
  'Continuous compliance validation',
];

export function SystemicResilience() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-xifoz-structural overflow-hidden"
    >
      <GridCoverage className="absolute inset-0" opacity={0.15} />
      <div className="absolute inset-0 bg-gradient-to-b from-xifoz-structural via-transparent to-xifoz-structural" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <div
            className={cn(
              'transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-cyan mb-4 block">
              Infrastructure
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-text-inverse tracking-tight mb-6">
              Resilience is a system,{' '}
              <span className="text-xifoz-cyan">not a feature.</span>
            </h2>
            <p className="text-base md:text-lg text-xifoz-text-inverse/70 leading-relaxed mb-8">
              We architect environments where failure is anticipated, contained, and automatically
              remediated. Our infrastructure-as-code approach ensures your security posture scales
              with your business.
            </p>
            <ul className="space-y-3">
              {pillars.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-xifoz-cyan flex-shrink-0" />
                  <span className="text-sm text-xifoz-text-inverse/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Security Metrics Grid */}
          <div
            className={cn(
              'transition-all duration-700 delay-300',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="bg-white/5 border border-white/10 rounded-card p-5 md:p-6 hover:border-white/20 transition-colors duration-300"
                  style={{
                    transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`,
                  }}
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-4', metric.bg)}>
                    <metric.icon size={18} className={metric.accent} />
                  </div>
                  <p className={cn('text-xl md:text-2xl font-semibold mb-1', metric.accent)}>
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-xifoz-text-inverse mb-1">
                    {metric.label}
                  </p>
                  <p className="text-xs text-xifoz-text-inverse/50 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
