import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallNavigation } from './InstallNavigation';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right-icon" className={className}>
      ArrowRight
    </div>
  ),
  AppWindow: ({ className }: { className?: string }) => (
    <div data-testid="app-window-icon" className={className}>
      AppWindow
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid={`button-${variant || 'default'}`} className={className} onClick={onClick}>
      {children}
    </button>
  ),
  PopoverTradeoffs: () => <div data-testid="popover-tradeoffs">Tradeoffs</div>,
}));

describe('InstallNavigation', () => {
  it('renders with default props', () => {
    render(<InstallNavigation />);

    const createKeysButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');
    const popover = screen.getByTestId('popover-tradeoffs');

    expect(createKeysButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();
    expect(popover).toBeInTheDocument();
  });

  it('displays default button texts', () => {
    render(<InstallNavigation />);

    expect(screen.getByText('Create keys in browser')).toBeInTheDocument();
    expect(screen.getByText('Continue with Pubky Ring')).toBeInTheDocument();
  });

  it('displays custom button texts', () => {
    render(<InstallNavigation createKeysText="Custom Create Keys" continueText="Custom Continue" />);

    expect(screen.getByText('Custom Create Keys')).toBeInTheDocument();
    expect(screen.getByText('Custom Continue')).toBeInTheDocument();
  });

  it('calls onCreateKeysInBrowser when create keys button is clicked', () => {
    const mockHandler = vi.fn();
    render(<InstallNavigation onCreateKeysInBrowser={mockHandler} />);

    const createKeysButton = screen.getByTestId('button-outline');
    fireEvent.click(createKeysButton);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('calls onContinueWithPubkyRing when continue button is clicked', () => {
    const mockHandler = vi.fn();
    render(<InstallNavigation onContinueWithPubkyRing={mockHandler} />);

    const continueButton = screen.getByTestId('button-default');
    fireEvent.click(continueButton);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('applies default className', () => {
    const { container } = render(<InstallNavigation />);

    const navigationContainer = container.firstChild as HTMLElement;
    expect(navigationContainer).toHaveClass(
      'flex',
      'flex-col-reverse',
      'lg:flex-row',
      'gap-3',
      'lg:gap-6',
      'justify-between',
    );
  });

  it('applies custom className', () => {
    const { container } = render(<InstallNavigation className="custom-class" />);

    const navigationContainer = container.firstChild as HTMLElement;
    expect(navigationContainer).toHaveClass('custom-class');
  });

  it('renders icons correctly', () => {
    render(<InstallNavigation />);

    const appWindowIcon = screen.getByTestId('app-window-icon');
    const arrowRightIcon = screen.getByTestId('arrow-right-icon');

    expect(appWindowIcon).toBeInTheDocument();
    expect(arrowRightIcon).toBeInTheDocument();
  });

  it('maintains proper structure', () => {
    const { container } = render(<InstallNavigation />);

    const navigationContainer = container.firstChild as HTMLElement;
    expect(navigationContainer.children).toHaveLength(2);

    // First child should contain the create keys button and popover
    const firstSection = navigationContainer.children[0];
    expect(firstSection).toHaveClass('flex', 'items-center', 'gap-1');

    // Second child should be the continue button
    const continueButton = navigationContainer.children[1];
    expect(continueButton).toHaveAttribute('data-testid', 'button-default');
  });

  it('handles undefined event handlers gracefully', () => {
    render(<InstallNavigation />);

    const createKeysButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');

    // These should not throw errors
    expect(() => fireEvent.click(createKeysButton)).not.toThrow();
    expect(() => fireEvent.click(continueButton)).not.toThrow();
  });
});
