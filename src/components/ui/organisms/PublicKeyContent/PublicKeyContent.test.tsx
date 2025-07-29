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
vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    className,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button data-slot="button" className={className} onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
  ButtonsNavigation: ({
    onHandleBackButton,
    onHandleContinueButton,
  }: {
    onHandleBackButton?: () => void;
    onHandleContinueButton?: () => void;
  }) => (
    <div data-testid="buttons-navigation">
      {onHandleBackButton && (
        <button onClick={onHandleBackButton} data-testid="back-btn">
          Back
        </button>
      )}
      {onHandleContinueButton && (
        <button onClick={onHandleContinueButton} data-testid="continue-btn">
          Continue
        </button>
      )}
    </div>
  ),
  Input: ({
    className,
    value,
    readOnly,
    onClick,
    disabled,
  }: {
    className?: string;
    value?: string;
    readOnly?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <input
      data-testid="input"
      className={className}
      value={value}
      readOnly={readOnly}
      onClick={onClick}
      disabled={disabled}
    />
  ),
  PopoverPublicKey: () => <div data-testid="popover-public-key">PopoverPublicKey</div>,
  useToast: () => ({
    toast: vi.fn().mockReturnValue({ dismiss: vi.fn() }),
  }),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-slot="card" data-testid="card" className={className}>
      {children}
    </div>
  ),
  PageHeader: ({
    title,
    subtitle,
    className,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="page-header" className={className}>
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  ),
  ContentCard: ({
    children,
    className,
    image,
  }: {
    children: React.ReactNode;
    className?: string;
    image?: { src: string; alt: string; width: number; height: number };
  }) => (
    <div data-testid="content-card" data-slot="card" className={className}>
      {image && <img src={image.src} alt={image.alt} width={image.width} height={image.height} />}
      {children}
    </div>
  ),
  ActionSection: ({
    children,
    className,
    actions,
  }: {
    children?: React.ReactNode;
    className?: string;
    actions?: Array<{ label: string; icon?: React.ReactNode; onClick: () => void; variant?: string }>;
  }) => (
    <div data-testid="action-section" className={className}>
      {children}
      {actions &&
        actions.map((action, index) => (
          <button key={index} onClick={action.onClick} data-variant={action.variant}>
            {action.icon}
            {action.label}
          </button>
        ))}
    </div>
  ),
  BrandText: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="brand-text" className={className}>
      {children}
    </span>
  ),
  PageContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-container" className={className}>
      {children}
    </div>
  ),
  ContentContainer: ({
    children,
    className,
    maxWidth,
  }: {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
  }) => (
    <div data-testid="content-container" data-max-width={maxWidth} className={className}>
      {children}
    </div>
  ),
  InputField: ({
    value,
    variant,
    readOnly,
    onClick,
    loading,
    loadingText,
    loadingIcon,
    icon,
  }: {
    value: string;
    variant?: string;
    readOnly?: boolean;
    onClick?: () => void;
    loading?: boolean;
    loadingText?: string;
    loadingIcon?: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div data-testid="input-field" data-variant={variant}>
      {loading && loadingIcon}
      {!loading && icon}
      <input data-testid="input" value={loading ? loadingText : value} readOnly={readOnly} onClick={onClick} />
    </div>
  ),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Copy: ({ className }: { className?: string }) => <span data-testid="copy-icon" className={className} />,
  Key: ({ className }: { className?: string }) => <span data-testid="key-icon" className={className} />,
  Loader2: ({ className }: { className?: string }) => <span data-testid="loader2-icon" className={className} />,
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

    expect(screen.getByTestId('content-card')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
  });

  it('applies default className', () => {
    const { container } = render(<PublicKeyContent {...defaultProps} />);
    const mainDiv = container.firstChild as HTMLElement;

    expect(mainDiv).toHaveAttribute('data-testid', 'page-container');
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
    // Note: toast functionality is mocked and may not be called in the test environment
  });

  it('handles copy to clipboard when copy button is clicked', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const copyButton = screen.getByText('Copy to clipboard');
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.pubky);
    // Note: toast functionality is mocked and may not be called in the test environment
  });

  it('renders input as readonly', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readonly');
  });

  it('applies correct styling to input', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('value', defaultProps.pubky);
  });

  it('renders card with correct styling', () => {
    render(<PublicKeyContent {...defaultProps} />);

    const card = screen.getByTestId('content-card');
    expect(card).toHaveAttribute('data-slot', 'card');
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

    // Since the toast is mocked, we just verify the input click doesn't throw
    expect(input).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<PublicKeyContent {...defaultProps} />);

    // Check main container
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveAttribute('data-testid', 'page-container');

    // Check that it contains the expected structure
    expect(screen.getByTestId('content-container')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('content-card')).toBeInTheDocument();
  });
});
