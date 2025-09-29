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
  Radio: ({ className }: { className?: string }) => (
    <div data-testid="radio-icon" className={className}>
      Radio
    </div>
  ),
  UsersRound2: ({ className }: { className?: string }) => (
    <div data-testid="users-round2-icon" className={className}>
      UsersRound2
    </div>
  ),
  HeartHandshake: ({ className }: { className?: string }) => (
    <div data-testid="heart-handshake-icon" className={className}>
      HeartHandshake
    </div>
  ),
  UserRound: ({ className }: { className?: string }) => (
    <div data-testid="user-round-icon" className={className}>
      UserRound
    </div>
  ),
  SquareAsterisk: ({ className }: { className?: string }) => (
    <div data-testid="square-asterisk-icon" className={className}>
      SquareAsterisk
    </div>
  ),
  Flame: ({ className }: { className?: string }) => (
    <div data-testid="flame-icon" className={className}>
      Flame
    </div>
  ),
  Columns3: ({ className }: { className?: string }) => (
    <div data-testid="columns3-icon" className={className}>
      Columns3
    </div>
  ),
  Menu: ({ className }: { className?: string }) => (
    <div data-testid="menu-icon" className={className}>
      Menu
    </div>
  ),
  LayoutGrid: ({ className }: { className?: string }) => (
    <div data-testid="layout-grid-icon" className={className}>
      LayoutGrid
    </div>
  ),
  Layers: ({ className }: { className?: string }) => (
    <div data-testid="layers-icon" className={className}>
      Layers
    </div>
  ),
  StickyNote: ({ className }: { className?: string }) => (
    <div data-testid="sticky-note-icon" className={className}>
      StickyNote
    </div>
  ),
  Newspaper: ({ className }: { className?: string }) => (
    <div data-testid="newspaper-icon" className={className}>
      Newspaper
    </div>
  ),
  Image: ({ className }: { className?: string }) => (
    <div data-testid="image-icon" className={className}>
      Image
    </div>
  ),
  CirclePlay: ({ className }: { className?: string }) => (
    <div data-testid="circle-play-icon" className={className}>
      CirclePlay
    </div>
  ),
  Link: ({ className }: { className?: string }) => (
    <div data-testid="link-icon" className={className}>
      Link
    </div>
  ),
  Download: ({ className }: { className?: string }) => (
    <div data-testid="download-icon" className={className}>
      Download
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
    <button data-slot="button" data-variant={variant} className={className} onClick={onClick} disabled={disabled}>
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

    const backButton = screen.getByRole('button', { name: /back/i });
    const continueButton = screen.getByRole('button', { name: /continue/i });

    expect(backButton).toBeInTheDocument();
    expect(continueButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent('Back');
    expect(continueButton).toHaveTextContent('Continue');
  });

  it('renders with custom text props', () => {
    render(<ButtonsNavigation backText="Go Back" continueText="Next Step" />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    const continueButton = screen.getByRole('button', { name: /next step/i });

    expect(backButton).toHaveTextContent('Go Back');
    expect(continueButton).toHaveTextContent('Next Step');
  });

  it('handles back button click', () => {
    const handleBackButton = vi.fn();
    render(<ButtonsNavigation onHandleBackButton={handleBackButton} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(handleBackButton).toHaveBeenCalledTimes(1);
  });

  it('handles continue button click', () => {
    const handleContinueButton = vi.fn();
    render(<ButtonsNavigation onHandleContinueButton={handleContinueButton} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueButton);

    expect(handleContinueButton).toHaveBeenCalledTimes(1);
  });

  it('disables back button when backButtonDisabled is true', () => {
    render(<ButtonsNavigation backButtonDisabled={true} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeDisabled();
  });

  it('disables continue button when continueButtonDisabled is true', () => {
    render(<ButtonsNavigation continueButtonDisabled={true} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });
});

describe('ButtonsNavigation - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ButtonsNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom text', () => {
    const { container } = render(<ButtonsNavigation backText="Go Back" continueText="Next Step" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<ButtonsNavigation className="custom-navigation-class" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with back button disabled', () => {
    const { container } = render(<ButtonsNavigation backButtonDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with continue button disabled', () => {
    const { container } = render(<ButtonsNavigation continueButtonDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with both buttons disabled', () => {
    const { container } = render(<ButtonsNavigation backButtonDisabled={true} continueButtonDisabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with both callbacks', () => {
    const mockBackHandler = vi.fn();
    const mockContinueHandler = vi.fn();

    const { container } = render(
      <ButtonsNavigation onHandleBackButton={mockBackHandler} onHandleContinueButton={mockContinueHandler} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with back callback only', () => {
    const mockBackHandler = vi.fn();

    const { container } = render(<ButtonsNavigation onHandleBackButton={mockBackHandler} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with continue callback only', () => {
    const mockContinueHandler = vi.fn();

    const { container } = render(<ButtonsNavigation onHandleContinueButton={mockContinueHandler} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
