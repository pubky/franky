export interface FAQAccordionItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQAccordionItem[];
  className?: string;
}
