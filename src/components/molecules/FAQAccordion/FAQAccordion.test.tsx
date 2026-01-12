import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FAQAccordion } from './FAQAccordion';
import type { FAQAccordionItem } from './FAQAccordion.types';
import { normaliseRadixIds } from '@/libs/utils/utils';

const mockItems: FAQAccordionItem[] = [
  {
    id: '1',
    question: 'What is Pubky?',
    answer: 'Pubky is a decentralized social platform.',
  },
  {
    id: '2',
    question: 'How do I sign up?',
    answer: 'You can sign up by creating a keypair.',
  },
];

describe('FAQAccordion', () => {
  it('renders all FAQ items', () => {
    render(<FAQAccordion items={mockItems} />);

    expect(screen.getByText('What is Pubky?')).toBeInTheDocument();
    expect(screen.getByText('How do I sign up?')).toBeInTheDocument();
  });
});

describe('FAQAccordion - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<FAQAccordion items={mockItems} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<FAQAccordion items={mockItems} className="custom-faq-class" />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty items', () => {
    const { container } = render(<FAQAccordion items={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with markdown answer content', () => {
    const markdownItems: FAQAccordionItem[] = [
      {
        id: '1',
        question: 'Complex question',
        answer: `First paragraph

- Item 1
- Item 2

1. Ordered item 1
2. Ordered item 2`,
      },
    ];
    const { container } = render(<FAQAccordion items={markdownItems} />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
