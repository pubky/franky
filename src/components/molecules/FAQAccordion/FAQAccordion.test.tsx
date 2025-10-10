import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FAQAccordion } from './FAQAccordion';
import type { FAQAccordionItem } from './FAQAccordion';

describe('FAQAccordion', () => {
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

  it('renders all FAQ items', () => {
    render(<FAQAccordion items={mockItems} />);

    expect(screen.getByText('What is Pubky?')).toBeInTheDocument();
    expect(screen.getByText('How do I sign up?')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<FAQAccordion items={mockItems} className="custom-class" />);
    const accordion = container.firstChild;
    expect(accordion).toHaveClass('custom-class');
  });

  it('renders with empty items array', () => {
    const { container } = render(<FAQAccordion items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders complex answer content', () => {
    const complexItems: FAQAccordionItem[] = [
      {
        id: '1',
        question: 'Complex question',
        answer: (
          <div>
            <p>First paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        ),
      },
    ];

    render(<FAQAccordion items={complexItems} />);
    expect(screen.getByText('Complex question')).toBeInTheDocument();
  });
});
