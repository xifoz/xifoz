import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { type FAQItem } from '@/data/faq';

interface FAQSectionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQSection({ items, className }: FAQSectionProps) {
  return (
    <Accordion type="single" collapsible className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="bg-xifoz-dark-surface border border-xifoz-dark-border rounded-lg px-5 md:px-6 data-[state=open]:shadow-sm transition-shadow duration-300"
        >
          <AccordionTrigger className="text-left text-sm md:text-base font-medium text-xifoz-dark-text hover:no-underline py-4 md:py-5 [&[data-state=open]>svg]:rotate-180">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-xifoz-dark-text-muted leading-relaxed pb-5">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
