import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { motion } from 'framer-motion';

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
  return (
    <SectionWrapper background="dim">
      <Container>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
            Compliance
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-xifoz-text tracking-tight mb-4">
            Aligned with Leading Security Frameworks
          </h2>
          <p className="text-base text-xifoz-text-secondary max-w-xl mx-auto">
            Our services map to all major compliance standards, helping you meet regulatory requirements with confidence.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {frameworks.map((framework, index) => (
            <motion.div
              key={framework}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="px-5 py-2.5 bg-xifoz-surface border border-xifoz-text/5 rounded-pill text-sm font-medium text-xifoz-text hover:border-xifoz-blue/20 hover:shadow-sm transition-all duration-300 cursor-default"
            >
              {framework}
            </motion.div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
