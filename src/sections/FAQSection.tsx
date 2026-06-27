import { Container } from '@/components/Container';
import { SectionWrapper } from '@/components/SectionWrapper';
import { FAQSection as FAQAccordion } from '@/components/FAQSection';
import { homeFAQ } from '@/data/faq';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function FAQSection() {
  return (
    <SectionWrapper background="base" id="faq">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-xifoz-blue mb-4 block">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-xifoz-dark-text tracking-tight mb-4">
              Frequently Asked Questions.
            </h2>
            <p className="text-base text-xifoz-dark-text-muted">
              Everything you need to know about our services.
            </p>
          </div>

          <FAQAccordion items={homeFAQ} />

          <div className="text-center mt-10">
            <p className="text-sm text-xifoz-dark-text-muted mb-3">
              Still have questions?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-xifoz-blue hover:gap-3 transition-all duration-300"
            >
              Contact our team
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
