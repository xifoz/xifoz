import { Container } from '@/components/Container';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, Server, Database, Globe, Lock, Wifi } from 'lucide-react';

const infrastructureItems = [
  { icon: Server, label: 'Compute', status: 'secure' },
  { icon: Database, label: 'Database', status: 'secure' },
  { icon: Globe, label: 'CDN', status: 'secure' },
  { icon: Lock, label: 'Firewall', status: 'secure' },
  { icon: Activity, label: 'Monitoring', status: 'active' },
  { icon: Wifi, label: 'Network', status: 'secure' },
  { icon: Server, label: 'Storage', status: 'secure' },
  { icon: Database, label: 'Cache', status: 'secure' },
];

export function MonitoredInfrastructure() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-xifoz-base overflow-hidden">
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Infrastructure Grid */}
          <div
            className={cn(
              'transition-all duration-700',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {infrastructureItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="bg-xifoz-surface border border-xifoz-text/5 rounded-card p-4 md:p-5 text-center hover:border-xifoz-blue/20 transition-colors duration-300"
                >
                  <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-xifoz-blue/5 flex items-center justify-center">
                    <item.icon size={16} className="text-xifoz-blue" />
                  </div>
                  <p className="text-xs font-medium text-xifoz-text mb-1">{item.label}</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        item.status === 'secure' ? 'bg-xifoz-success' : 'bg-xifoz-cyan'
                      )}
                    />
                    <span className="text-[10px] text-xifoz-text-secondary capitalize">
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right - Text */}
          <div
            className={cn(
              'transition-all duration-700 delay-200',
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
              Monitoring
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-text tracking-tight mb-6">
              We monitor your code and infrastructure so you do not have to
            </h2>
            <p className="text-base md:text-lg text-xifoz-text-secondary leading-relaxed mb-8">
              From dependency vulnerabilities to runtime exploits, XIFOZ integrates directly into your CI/CD pipeline. Continuous monitoring ensures threats are caught before they reach production.
            </p>
            <div className="flex flex-wrap gap-4">
              {['Real-time Alerts', 'Automated Patching', 'Vulnerability Scanning', 'Log Analysis'].map(
                (feature) => (
                  <span
                    key={feature}
                    className="px-4 py-2 bg-xifoz-dim rounded-pill text-xs font-medium text-xifoz-text-secondary"
                  >
                    {feature}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
