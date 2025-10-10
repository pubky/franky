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

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <AccordionPrimitive.Root type="single" collapsible className={Libs.cn('w-full flex-col gap-4 flex', className)}>
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          className="w-full border border-border rounded-lg overflow-hidden"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger
              className={Libs.cn(
                'w-full px-6 py-4 flex justify-between items-center',
                'hover:bg-white/5 transition-colors cursor-pointer',
                'group',
              )}
            >
              <span className="text-base font-semibold text-left">{item.question}</span>
              <Libs.ChevronDown
                size={20}
                className={Libs.cn('transition-transform flex-shrink-0 ml-4', 'group-data-[state=open]:rotate-180')}
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
            <div className="px-6 pb-4 pt-2 text-base font-medium leading-6 text-muted-foreground">{item.answer}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
