import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium',
    );
    expect(badge).toHaveAttribute('data-slot', 'badge');
    // data-variant is only set when variant prop is explicitly provided
    expect(badge).not.toHaveAttribute('data-variant');
  });

  it('renders default variant correctly', () => {
    render(<Badge variant="default">Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders secondary variant correctly', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders destructive variant correctly', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText('Destructive');
    expect(badge).toHaveClass('bg-destructive', 'text-white');
  });

  it('renders outline variant correctly', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('text-foreground', 'bg-background');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-badge');
  });

  it('forwards additional props', () => {
    render(
      <Badge data-testid="badge" data-custom="test">
        Test
      </Badge>,
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('data-custom', 'test');
  });

  it('renders as div element by default', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('DIV');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );

    const link = screen.getByRole('link', { name: /link badge/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveAttribute('data-slot', 'badge');
  });

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>Child content</span>
      </Badge>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Badge ref={ref}>Badge</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('forwards ref correctly with asChild', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Badge asChild>
        <a ref={ref} href="/test">
          Link Badge
        </a>
      </Badge>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('has correct data attributes', () => {
    render(<Badge variant="secondary">Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
  });

  it('supports accessibility attributes', () => {
    render(
      <Badge aria-label="Status badge" role="status">
        Active
      </Badge>,
    );
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });

  it('handles focus states correctly', () => {
    render(<Badge tabIndex={0}>Focusable Badge</Badge>);
    const badge = screen.getByText('Focusable Badge');
    expect(badge).toHaveAttribute('tabIndex', '0');
    expect(badge).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
  });

  it('handles hover states correctly', () => {
    render(<Badge variant="default">Hover Badge</Badge>);
    const badge = screen.getByText('Hover Badge');
    expect(badge).toHaveClass('[a&]:hover:bg-primary/90');
  });

  it('handles invalid states correctly', () => {
    render(<Badge aria-invalid="true">Invalid Badge</Badge>);
    const badge = screen.getByText('Invalid Badge');
    expect(badge).toHaveAttribute('aria-invalid', 'true');
    expect(badge).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive');
  });

  it('renders with icons correctly', () => {
    render(
      <Badge>
        <span>🎉</span>
        <span>New Feature</span>
      </Badge>,
    );
    expect(screen.getByText('🎉')).toBeInTheDocument();
    expect(screen.getByText('New Feature')).toBeInTheDocument();
  });

  it('handles long text correctly', () => {
    const longText = 'This is a very long badge text that should be handled properly';
    render(<Badge>{longText}</Badge>);
    const badge = screen.getByText(longText);
    expect(badge).toHaveClass('whitespace-nowrap', 'overflow-hidden');
  });

  it('applies all base classes correctly', () => {
    render(<Badge>Base Classes Test</Badge>);
    const badge = screen.getByText('Base Classes Test');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'border',
      'px-2',
      'py-0.5',
      'text-xs',
      'font-medium',
      'w-fit',
      'whitespace-nowrap',
      'shrink-0',
      'gap-1',
      'border-transparent',
      'transition-[color,box-shadow]',
      'overflow-hidden',
    );
  });
});
