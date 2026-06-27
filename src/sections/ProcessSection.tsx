import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { ProcessStep } from '@/components/ProcessStep';
import { processSteps } from '@/data/process';

export function ProcessSection() {
  return (
    <SectionWrapper background="base" id="process">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-accent mb-4 block">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-text tracking-tight mb-4">
            How We Work?
          </h2>
          <p className="text-base md:text-lg text-xifoz-text-secondary max-w-2xl mx-auto">
            A proven methodology that delivers results — from initial assessment to ongoing protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {processSteps.map((step) => (
            <ProcessStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
