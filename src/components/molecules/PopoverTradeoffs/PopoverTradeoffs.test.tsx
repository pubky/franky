import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PopoverTradeoffs } from './PopoverTradeoffs';

// Mock icons from @/libs/icons
vi.mock('@/libs/icons', () => ({
  AlertTriangle: ({ className }: { className?: string }) => (
    <div data-testid="alert-triangle-icon" className={className}>
      AlertTriangle
    </div>
  ),
}));

// Mock atoms and molecules
vi.mock('@/atoms', () => ({
  Button: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <button data-testid={`button-${variant || 'default'}`} className={className}>
      {children}
    </button>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid={`heading-${level || 1}`} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/molecules', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
  PopoverContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="popover-content" className={className}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="popover-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
}));

describe('PopoverTradeoffs', () => {
  it('renders with default props', () => {
    render(<PopoverTradeoffs />);

    const popover = screen.getByTestId('popover');
    const trigger = screen.getByTestId('popover-trigger');
    const content = screen.getByTestId('popover-content');
    const button = screen.getByTestId('button-ghost');

    expect(popover).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('renders alert triangle icon in trigger button', () => {
    render(<PopoverTradeoffs />);

    const alertIcon = screen.getByTestId('alert-triangle-icon');
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveClass('h-4', 'w-4');
  });

  it('applies correct styling to popover content', () => {
    render(<PopoverTradeoffs />);

    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('w-full');
  });

  it('renders tradeoffs title', () => {
    render(<PopoverTradeoffs />);

    const title = screen.getByText('Be aware of these tradeoffs:');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H4');
    expect(title).toHaveClass('text-popover-foreground');
  });

  it('renders tradeoffs content', () => {
    render(<PopoverTradeoffs />);

    expect(screen.getByText(/Less secure than mobile keychain/)).toBeInTheDocument();
    expect(screen.getByText(/Browser-based key generation/)).toBeInTheDocument();
    expect(screen.getByText(/Suboptimal sign-in experience/)).toBeInTheDocument();
  });

  it('trigger uses asChild prop correctly', () => {
    render(<PopoverTradeoffs />);

    const trigger = screen.getByTestId('popover-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('button has correct variant and size', () => {
    render(<PopoverTradeoffs />);

    const button = screen.getByTestId('button-ghost');
    expect(button).toBeInTheDocument();
  });

  it('maintains proper content structure', () => {
    render(<PopoverTradeoffs />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('list-disc', 'list-inside', 'text-muted-foreground', 'text-sm');
  });

  it('renders security comparison information', () => {
    render(<PopoverTradeoffs />);

    // Check for security-related content
    expect(screen.getByText(/Less secure than mobile keychain/)).toBeInTheDocument();
    expect(screen.getByText(/Browser-based key generation/)).toBeInTheDocument();
  });

  it('icon has correct accessibility attributes', () => {
    render(<PopoverTradeoffs />);

    const alertIcon = screen.getByTestId('alert-triangle-icon');
    expect(alertIcon).toBeInTheDocument();
  });
});
