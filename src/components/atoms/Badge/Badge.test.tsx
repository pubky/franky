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
    expect(badge).toHaveAttribute('data-testid', 'badge-default');
    expect(badge).toHaveAttribute('data-variant', 'default');
  });

  it('renders default variant correctly', () => {
    render(<Badge variant="default">Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground');
  });

  it('renders secondary variant correctly', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText('Secondary');
    expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground');
  });

  it('renders destructive variant correctly', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText('Destructive');
    expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-white');
  });

  it('renders outline variant correctly', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('text-foreground');
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
  });

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>Child content</span>
      </Badge>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('has correct test id for different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    let badge = screen.getByTestId('badge-secondary');
    expect(badge).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    badge = screen.getByTestId('badge-destructive');
    expect(badge).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    badge = screen.getByTestId('badge-outline');
    expect(badge).toBeInTheDocument();
  });

  it('has correct data attributes', () => {
    render(<Badge variant="secondary">Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
    expect(badge).toHaveAttribute('data-testid', 'badge-secondary');
  });
});
