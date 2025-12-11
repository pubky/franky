'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as Libs from '@/libs';

export interface FAQAccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export interface FAQAccordionProps {
  items: FAQAccordionItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps): React.ReactElement {
  return (
    <AccordionPrimitive.Root type="single" collapsible className={Libs.cn('flex w-full flex-col gap-4', className)}>
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          className="w-full overflow-hidden rounded-lg border border-border"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              className={Libs.cn(
                'flex w-full items-center justify-between px-6 py-4',
                'cursor-pointer transition-colors hover:bg-white/5',
                'group',
              )}
            >
              <span className="text-left text-base font-semibold">{item.question}</span>
              <Libs.ChevronDown
                size={20}
                className={Libs.cn('ml-4 flex-shrink-0 transition-transform', 'group-data-[state=open]:rotate-180')}
              />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            className={Libs.cn(
              'overflow-hidden',
              'data-[state=closed]:animate-accordion-up',
              'data-[state=open]:animate-accordion-down',
            )}
          >
            <div className="px-6 pt-2 pb-4 text-base leading-6 font-medium text-muted-foreground">{item.answer}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
