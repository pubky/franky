/* eslint-disable @next/next/no-img-element */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('SocialLink', () => {
  it('renders with default props', () => {
    render(
      <Link href="https://example.com">
        <span>Test Icon</span>
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveClass('cursor-pointer', 'text-brand', 'hover:text-brand/80', 'transition-colors', 'text-sm');
    expect(screen.getByText('Test Icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Link href="https://example.com" className="custom-link-class">
        <span>Test Icon</span>
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-link-class');
  });

  it('renders different types of children', () => {
    const { rerender } = render(
      <Link href="https://example.com">
        <svg data-testid="svg-icon">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </Link>,
    );

    expect(screen.getByTestId('svg-icon')).toBeInTheDocument();

    rerender(
      <Link href="https://example.com">
        <img src="/icon.png" alt="Icon" data-testid="img-icon" />
      </Link>,
    );

    expect(screen.getByTestId('img-icon')).toBeInTheDocument();
  });

  it('handles different href formats', () => {
    const { rerender } = render(
      <Link href="mailto:test@example.com">
        <span>Email</span>
      </Link>,
    );

    let link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');

    rerender(
      <Link href="tel:+1234567890">
        <span>Phone</span>
      </Link>,
    );

    link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:+1234567890');
  });
});
