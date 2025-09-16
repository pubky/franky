import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonsNavigation } from './ButtonsNavigation';

// Mock @/libs to intercept Libs.ArrowLeft and Libs.ArrowRight
vi.mock('@/libs', () => ({
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
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
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
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('ButtonsNavigation', () => {
  it('renders with default props', () => {
    render(<ButtonsNavigation />);

    const backButton = screen.getByTestId('button-secondary');
    const continueButton = screen.getByTestId('button-default');

    expect(backButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent('Back');
    expect(continueButton).toHaveTextContent('Continue');
  });

  it('handles back button click', () => {
    const handleBackButton = vi.fn();
    render(<ButtonsNavigation onHandleBackButton={handleBackButton} />);

    const backButton = screen.getByTestId('button-secondary');
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

    const backButton = screen.getByTestId('button-secondary');
    expect(backButton).toBeDisabled();
  });

  it('disables continue button when continueButtonDisabled is true', () => {
    render(<ButtonsNavigation continueButtonDisabled={true} />);

    const continueButton = screen.getByTestId('button-default');
    expect(continueButton).toBeDisabled();
  });
});

describe('ButtonsNavigation - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ButtonsNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<ButtonsNavigation />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customTextContainer } = render(
      <ButtonsNavigation backText="Go Back" continueText="Next Step" />,
    );
    expect(customTextContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<ButtonsNavigation className="custom-navigation-class" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different disabled states', () => {
    const { container: backDisabledContainer } = render(<ButtonsNavigation backButtonDisabled={true} />);
    expect(backDisabledContainer.firstChild).toMatchSnapshot();

    const { container: continueDisabledContainer } = render(<ButtonsNavigation continueButtonDisabled={true} />);
    expect(continueDisabledContainer.firstChild).toMatchSnapshot();

    const { container: bothDisabledContainer } = render(
      <ButtonsNavigation backButtonDisabled={true} continueButtonDisabled={true} />,
    );
    expect(bothDisabledContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different callback configurations', () => {
    const mockBackHandler = vi.fn();
    const mockContinueHandler = vi.fn();

    const { container: withCallbacksContainer } = render(
      <ButtonsNavigation onHandleBackButton={mockBackHandler} onHandleContinueButton={mockContinueHandler} />,
    );
    expect(withCallbacksContainer.firstChild).toMatchSnapshot();

    const { container: backOnlyContainer } = render(<ButtonsNavigation onHandleBackButton={mockBackHandler} />);
    expect(backOnlyContainer.firstChild).toMatchSnapshot();

    const { container: continueOnlyContainer } = render(
      <ButtonsNavigation onHandleContinueButton={mockContinueHandler} />,
    );
    expect(continueOnlyContainer.firstChild).toMatchSnapshot();
  });
});
