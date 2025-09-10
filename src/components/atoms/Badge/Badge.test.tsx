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

  it('renders as span element by default', () => {
    render(<Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('SPAN');
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
});

describe('Badge - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Badge>Default Badge</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for all variants', () => {
    const { container: defaultContainer } = render(<Badge variant="default">Default</Badge>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: secondaryContainer } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(secondaryContainer.firstChild).toMatchSnapshot();

    const { container: destructiveContainer } = render(<Badge variant="destructive">Destructive</Badge>);
    expect(destructiveContainer.firstChild).toMatchSnapshot();

    const { container: outlineContainer } = render(<Badge variant="outline">Outline</Badge>);
    expect(outlineContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: customContainer } = render(<Badge className="custom-badge">Custom</Badge>);
    expect(customContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <Badge>
        <span>Complex Content</span>
      </Badge>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for asChild prop', () => {
    const { container } = render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
