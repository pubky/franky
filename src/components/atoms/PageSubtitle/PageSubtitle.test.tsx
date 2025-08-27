import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageSubtitle } from './PageSubtitle';

describe('PageSubtitle', () => {
  it('renders with default props', () => {
    render(<PageSubtitle>Test subtitle</PageSubtitle>);

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle.tagName).toBe('H2');
    expect(subtitle).toHaveClass('text-xl', 'lg:text-2xl', 'text-muted-foreground', 'font-light', 'leading-normal');
  });

  it('applies custom className', () => {
    render(<PageSubtitle className="custom-subtitle">Test subtitle</PageSubtitle>);

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toHaveClass('custom-subtitle');
  });

  it('renders complex children correctly', () => {
    render(
      <PageSubtitle>
        <span>Complex</span> <strong>subtitle</strong> content
      </PageSubtitle>,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <PageSubtitle data-testid="page-subtitle" id="subtitle-id">
        Test
      </PageSubtitle>,
    );

    const subtitle = screen.getByTestId('page-subtitle');
    expect(subtitle).toHaveAttribute('id', 'subtitle-id');
  });
});
