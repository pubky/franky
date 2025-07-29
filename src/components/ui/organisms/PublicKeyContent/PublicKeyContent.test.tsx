import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicKeyContent } from './PublicKeyContent';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock useToast hook
const mockToast = vi.fn();
const mockToastInstance = {
  id: '1',
  dismiss: vi.fn(),
  update: vi.fn(),
};

// Mock UI components
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    useToast: () => ({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    }),
    Button: ({
      children,
      variant,
      className,
      onClick,
      ...props
    }: {
      children: React.ReactNode;
      variant?: string;
      className?: string;
      onClick?: () => void;
      [key: string]: unknown;
    }) => (
      <button data-testid="button" data-variant={variant} className={className} onClick={onClick} {...props}>
        {children}
      </button>
    ),
    ButtonsNavigation: ({
      onHandleBackButton,
      onHandleContinueButton,
      ...props
    }: {
      onHandleBackButton?: () => void;
      onHandleContinueButton?: () => void;
      [key: string]: unknown;
    }) => (
      <div data-testid="buttons-navigation" {...props}>
        <button onClick={onHandleBackButton}>Back</button>
        {onHandleContinueButton && <button onClick={onHandleContinueButton}>Continue</button>}
      </div>
    ),
    Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="card" className={className}>
        {children}
      </div>
    ),
    Input: ({
      value,
      onClick,
      className,
      ...props
    }: {
      value?: string;
      onClick?: () => void;
      className?: string;
      [key: string]: unknown;
    }) => <input data-testid="input" value={value} onClick={onClick} className={className} {...props} />,
    PopoverPublicKey: ({ className }: { className?: string }) => (
      <div data-testid="popover-public-key" className={className} />
    ),
  };
});

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Copy: () => <svg data-testid="copy-icon" />,
  Key: () => <svg data-testid="key-icon" />,
}));

describe('PublicKeyContent', () => {
  const defaultProps = {
    pubky: 'kls37f5pimru3n3iqo9aunodfrrjs7jujuzpdoumf95ttekxri8o',
    onHandleBackButton: vi.fn(),
    onHandleContinueButton: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockReturnValue(mockToastInstance);
  });

  it('renders with default props', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<PublicKeyContent {...defaultProps} />);
    const mainDiv = container.firstChild as HTMLElement;

    expect(mainDiv).toHaveClass('container', 'mx-auto', 'px-6', 'lg:px-10', 'lg:pt-8');
  });

  it('applies custom className', () => {
    const customClass = 'custom-class-name';
    const { container } = render(<PublicKeyContent {...defaultProps} className={customClass} />);
    const mainDiv = container.firstChild as HTMLElement;

    expect(mainDiv).toHaveClass(customClass);
  });

  it('displays the correct pubky value', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveValue(defaultProps.pubky);
  });

  it('displays different pubky values correctly', () => {
    const customPubky = 'different-pubky-value-12345';
    render(<PublicKeyContent {...defaultProps} pubky={customPubky} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveValue(customPubky);
  });

  it('renders main title correctly', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByText('Your unique')).toBeInTheDocument();
    expect(screen.getByText('pubky.')).toBeInTheDocument();
  });

  it('renders subtitle correctly', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByText('Share your pubky with your friends so they can follow you.')).toBeInTheDocument();
  });

  it('renders section title correctly', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByText('Your pubky')).toBeInTheDocument();
  });

  it('renders copy button with correct text', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
  });

  it('renders copy and key icons', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    expect(screen.getByTestId('key-icon')).toBeInTheDocument();
  });

  it('renders PopoverPublicKey component', () => {
    render(<PublicKeyContent {...defaultProps} />);

    expect(screen.getByTestId('popover-public-key')).toBeInTheDocument();
  });

  it('renders key image on desktop', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const keyImage = screen.getByAltText('Key');
    expect(keyImage).toBeInTheDocument();
    expect(keyImage).toHaveAttribute('src', '/images/key.png');
  });

  it('calls onHandleBackButton when back button is clicked', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(defaultProps.onHandleBackButton).toHaveBeenCalledTimes(1);
  });

  it('calls onHandleContinueButton when continue button is clicked', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);

    expect(defaultProps.onHandleContinueButton).toHaveBeenCalledTimes(1);
  });

  it('does not render continue button when onHandleContinueButton is not provided', () => {
    const propsWithoutContinue = {
      ...defaultProps,
      onHandleContinueButton: undefined,
    };

    render(<PublicKeyContent {...propsWithoutContinue} />);

    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  it('handles copy to clipboard when input is clicked', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    fireEvent.click(input);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.pubky);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Pubky copied to clipboard',
      description: defaultProps.pubky,
      action: expect.any(Object),
    });
  });

  it('handles copy to clipboard when copy button is clicked', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const copyButton = screen.getByText('Copy to clipboard');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.pubky);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Pubky copied to clipboard',
      description: defaultProps.pubky,
      action: expect.any(Object),
    });
  });

  it('renders input as readonly', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readOnly');
  });

  it('applies correct styling to input', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveClass(
      'text-base',
      'font-medium',
      'text-brand',
      '!bg-transparent',
      'w-full',
      'h-12',
      'border-none',
    );
  });

  it('renders card with correct styling', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6', 'lg:p-12');
  });

  it('handles missing onHandleBackButton gracefully', () => {
    const propsWithoutBack = {
      ...defaultProps,
      onHandleBackButton: undefined,
    };

    expect(() => {
      render(<PublicKeyContent {...propsWithoutBack} />);
    }).not.toThrow();
  });

  it('creates toast action button with correct properties', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    fireEvent.click(input);

    const toastCall = mockToast.mock.calls[0][0];
    expect(toastCall.action).toBeDefined();
    expect(toastCall.title).toBe('Pubky copied to clipboard');
    expect(toastCall.description).toBe(defaultProps.pubky);
  });

  it('has correct layout structure', () => {
    const { container } = render(<PublicKeyContent {...defaultProps} />);

    // Check main container
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('container', 'mx-auto');

    // Check that it contains the expected structure
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
  });
});
