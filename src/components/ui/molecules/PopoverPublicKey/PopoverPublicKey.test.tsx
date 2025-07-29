import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PopoverPublicKey } from './PopoverPublicKey';

// Mock lucide-react
vi.mock('lucide-react', () => ({
  CircleHelp: () => <svg data-testid="circle-help-icon" />,
}));

// Mock UI components
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    Button: ({
      children,
      variant,
      size,
      className,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      variant?: string;
      size?: string;
      className?: string;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button
        data-testid="popover-button"
        data-variant={variant}
        data-size={size}
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    ),
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
  };
});

describe('PopoverPublicKey', () => {
  it('renders with default props', () => {
    render(<PopoverPublicKey />);

    const popover = screen.getByTestId('popover');
    const trigger = screen.getByTestId('popover-trigger');
    const button = screen.getByTestId('popover-button');
    const content = screen.getByTestId('popover-content');

    expect(popover).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('applies default className to button', () => {
    render(<PopoverPublicKey />);

    const button = screen.getByTestId('popover-button');
    expect(button).toHaveClass('hover:bg-white/10');
  });

  it('applies custom className to button', () => {
    render(<PopoverPublicKey className="custom-class" />);

    const button = screen.getByTestId('popover-button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders button with correct variant and size', () => {
    render(<PopoverPublicKey />);

    const button = screen.getByTestId('popover-button');
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'icon');
  });

  it('renders CircleHelp icon with correct styling', () => {
    render(<PopoverPublicKey />);

    const icon = screen.getByTestId('circle-help-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders popover content with correct width', () => {
    render(<PopoverPublicKey />);

    const content = screen.getByTestId('popover-content');
    expect(content).toHaveClass('w-[327px]');
  });

  it('renders correct title text', () => {
    render(<PopoverPublicKey />);

    const title = screen.getByText('Why not a normal user @handle?');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-base', 'font-bold', 'text-popover-foreground');
  });

  it('renders correct description text', () => {
    render(<PopoverPublicKey />);

    const description = screen.getByText(
      /This user handle is a cryptographic public key, making it unique and platform-independent/,
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');
  });

  it('renders complete description text', () => {
    render(<PopoverPublicKey />);

    const fullDescription = screen.getByText(
      'This user handle is a cryptographic public key, making it unique and platform-independent. No need for a centralized username registry.',
    );
    expect(fullDescription).toBeInTheDocument();
  });

  it('has correct content structure', () => {
    render(<PopoverPublicKey />);

    // Check the content container has correct classes
    const contentDiv = screen.getByTestId('popover-content').firstChild as HTMLElement;
    expect(contentDiv).toHaveClass('flex', 'flex-col', 'gap-6', 'px-3', 'py-2');

    // Check the inner content div has correct classes
    const innerDiv = contentDiv.firstChild as HTMLElement;
    expect(innerDiv).toHaveClass('flex', 'flex-col', 'gap-2');
  });

  it('sets asChild prop on PopoverTrigger', () => {
    render(<PopoverPublicKey />);

    const trigger = screen.getByTestId('popover-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('can be clicked to potentially open popover', () => {
    // We'll simulate a click on the button
    render(<PopoverPublicKey />);

    const button = screen.getByTestId('popover-button');
    fireEvent.click(button);

    // The button should be clickable (no errors thrown)
    expect(button).toBeInTheDocument();
  });

  it('renders with correct accessibility structure', () => {
    render(<PopoverPublicKey />);

    const button = screen.getByTestId('popover-button');
    const content = screen.getByTestId('popover-content');

    // Button should be focusable and clickable
    expect(button).toBeInstanceOf(HTMLButtonElement);

    // Content should contain descriptive text
    expect(content).toHaveTextContent('Why not a normal user @handle?');
  });

  it('handles className prop correctly when undefined', () => {
    render(<PopoverPublicKey className={undefined} />);

    const button = screen.getByTestId('popover-button');
    // Should use default className when undefined is passed
    expect(button.className).toBe('hover:bg-white/10');
  });

  it('handles empty className prop', () => {
    render(<PopoverPublicKey className="" />);

    const button = screen.getByTestId('popover-button');
    expect(button.className).toBe('');
  });
});
