import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonsNavigation } from './ButtonsNavigation';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right-icon" className={className}>
      ArrowRight
    </div>
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left-icon" className={className}>
      ArrowLeft
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
    disabled,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid={`button-${variant || 'default'}`} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe('ButtonsNavigation', () => {
  it('renders with default props', () => {
    render(<ButtonsNavigation />);

    const backButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');

    expect(backButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent('Back');
    expect(continueButton).toHaveTextContent('Continue');
  });

  it('renders with custom text props', () => {
    render(<ButtonsNavigation backText="Go Back" continueText="Next Step" />);

    const backButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');

    expect(backButton).toHaveTextContent('Go Back');
    expect(continueButton).toHaveTextContent('Next Step');
  });

  it('handles back button click', () => {
    const handleBackButton = vi.fn();
    render(<ButtonsNavigation onHandleBackButton={handleBackButton} />);

    const backButton = screen.getByTestId('button-outline');
    fireEvent.click(backButton);

    expect(handleBackButton).toHaveBeenCalledTimes(1);
  });

  it('handles continue button click', () => {
    const handleContinueButton = vi.fn();
    render(<ButtonsNavigation onHandleContinueButton={handleContinueButton} />);

    const continueButton = screen.getByTestId('button-default');
    fireEvent.click(continueButton);

    expect(handleContinueButton).toHaveBeenCalledTimes(1);
  });

  it('disables back button when backButtonDisabled is true', () => {
    render(<ButtonsNavigation backButtonDisabled={true} />);

    const backButton = screen.getByTestId('button-outline');
    expect(backButton).toBeDisabled();
  });

  it('disables continue button when continueButtonDisabled is true', () => {
    render(<ButtonsNavigation continueButtonDisabled={true} />);

    const continueButton = screen.getByTestId('button-default');
    expect(continueButton).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<ButtonsNavigation className="custom-navigation-class" />);

    const container = screen.getByTestId('button-outline').parentElement;
    expect(container).toHaveClass('custom-navigation-class');
  });

  it('renders arrow icons', () => {
    render(<ButtonsNavigation />);

    const leftArrow = screen.getByTestId('arrow-left-icon');
    const rightArrow = screen.getByTestId('arrow-right-icon');

    expect(leftArrow).toBeInTheDocument();
    expect(rightArrow).toBeInTheDocument();
  });

  it('has proper button structure and styling', () => {
    render(<ButtonsNavigation />);

    const backButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');

    expect(backButton).toHaveClass('rounded-full');
    expect(continueButton).toHaveClass('rounded-full');
  });

  it('renders both buttons as enabled by default', () => {
    render(<ButtonsNavigation />);

    const backButton = screen.getByTestId('button-outline');
    const continueButton = screen.getByTestId('button-default');

    expect(backButton).not.toBeDisabled();
    expect(continueButton).not.toBeDisabled();
  });
});
