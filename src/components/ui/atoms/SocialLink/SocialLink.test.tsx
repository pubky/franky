/* eslint-disable @next/next/no-img-element */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLink } from './SocialLink';

describe('SocialLink', () => {
  it('renders with default props', () => {
    render(
      <SocialLink href="https://example.com">
        <span>Test Icon</span>
      </SocialLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('text-muted-foreground', 'hover:text-foreground', 'transition-colors');
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <SocialLink href="https://example.com" className="custom-link-class">
        <span>Test Icon</span>
      </SocialLink>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-link-class');
  });

  it('renders different types of children', () => {
    const { rerender } = render(
      <SocialLink href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </SocialLink>,
    );

    expect(screen.getByTestId('svg-icon')).toBeInTheDocument();

    rerender(
      <SocialLink href="https://example.com">
        <img src="/icon.png" alt="Icon" data-testid="img-icon" />
      </SocialLink>,
    );

    expect(screen.getByTestId('img-icon')).toBeInTheDocument();
  });

  it('handles different href formats', () => {
    const { rerender } = render(
      <SocialLink href="mailto:test@example.com">
        <span>Email</span>
      </SocialLink>,
    );

    let link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');

    rerender(
      <SocialLink href="tel:+1234567890">
        <span>Phone</span>
      </SocialLink>,
    );

    link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:+1234567890');
  });
});
