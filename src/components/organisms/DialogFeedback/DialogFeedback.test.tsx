import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogFeedback } from './DialogFeedback';

// Mock Radix UI Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog-root" data-open={open} onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  ),
  Trigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
  Content: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} aria-label={hiddenTitle}>
      {children}
    </div>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ className }: { className?: string }) => <div data-testid="dialog-overlay" className={className} />,
  Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="dialog-close" className={className}>
      {children}
    </button>
  ),
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  Description: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
}));

// Mock hooks
const mockUseCurrentUserProfile = vi.fn();
const mockUseFeedback = vi.fn();

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useCurrentUserProfile: () => mockUseCurrentUserProfile(),
    useFeedback: () => mockUseFeedback(),
  };
});

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(
    ({ postId, characterCount, maxLength }: { postId: string; characterCount?: number; maxLength?: number }) => (
      <div
        data-testid="post-header"
        data-post-id={postId}
        data-character-count={characterCount}
        data-max-length={maxLength}
      >
        PostHeader
      </div>
    ),
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="dialog" data-open={open} onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} aria-label={hiddenTitle}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
  DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  DialogClose: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-close" data-as-child={asChild}>
      {children}
    </div>
  ),
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  Textarea: ({
    placeholder,
    value,
    onChange,
    disabled,
    maxLength,
    className,
  }: {
    ref?: React.Ref<HTMLTextAreaElement>;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    maxLength?: number;
    className?: string;
  }) => (
    <textarea
      data-testid="textarea"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      className={className}
    />
  ),
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
  Typography: ({
    children,
    as,
    size,
    className,
  }: {
    children: React.ReactNode;
    as?: string;
    size?: string;
    className?: string;
  }) => (
    <p data-testid="typography" data-as={as} data-size={size} className={className}>
      {children}
    </p>
  ),
}));

// Mock libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Check: () => <span data-testid="check-icon">✓</span>,
    Send: () => <span data-testid="send-icon">→</span>,
    Loader2: () => <span data-testid="loader-icon">⟳</span>,
  };
});

describe('DialogFeedback', () => {
  const mockOnOpenChange = vi.fn();
  const mockHandleChange = vi.fn();
  const mockSubmit = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'test-user-123',
    });
    mockUseFeedback.mockReturnValue({
      feedback: '',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: false,
      reset: mockReset,
    });
  });

  it('renders with required props', () => {
    render(<DialogFeedback open={false} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
  });

  it('returns null when currentUserPubky is not available', () => {
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: null,
    });

    const { container } = render(<DialogFeedback open={false} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders feedback form when not in success state', () => {
    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Provide Feedback');
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    expect(screen.getByTestId('post-header')).toBeInTheDocument();
  });

  it('renders success state when isSuccess is true', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: true,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Feedback Received');
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('Thank you for helping us improve Pubky.');
  });

  it('shows Send button when hasContent is true', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const buttons = screen.getAllByTestId('button');
    const sendButton = buttons.find((btn) => btn.textContent?.includes('Send'));
    expect(sendButton).toBeInTheDocument();
  });

  it('does not show Send button when hasContent is false', () => {
    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const buttons = screen.queryAllByTestId('button');
    const sendButton = buttons.find((btn) => btn.textContent?.includes('Send'));
    // Button is always rendered but hidden with opacity-0 when hasContent is false
    expect(sendButton).toBeDefined();
    const container = sendButton?.closest('[data-testid="container"]');
    expect(container).toHaveClass('opacity-0');
  });

  it('calls handleChange when textarea value changes', () => {
    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'New feedback' } });

    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('calls submit when Send button is clicked', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const buttons = screen.getAllByTestId('button');
    const sendButton = buttons.find((btn) => btn.textContent?.includes('Send'));
    fireEvent.click(sendButton!);

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('disables Send button when isSubmitting is true', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: true,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const buttons = screen.getAllByTestId('button');
    // When submitting, button shows loader icon, so find by variant and disabled state
    const sendButton = buttons.find((btn) => btn.getAttribute('data-variant') === 'secondary' && btn.disabled);
    expect(sendButton).toBeDefined();
    expect(sendButton).toBeDisabled();
  });

  it('shows loader icon when isSubmitting is true', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: true,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('calls reset when dialog closes', () => {
    const { rerender } = render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    rerender(<DialogFeedback open={false} onOpenChange={mockOnOpenChange} />);

    expect(mockReset).toHaveBeenCalled();
  });

  it('calls onOpenChange when close button is clicked in success state', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: true,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const buttons = screen.getAllByTestId('button');
    const closeButton = buttons.find((btn) => btn.textContent?.includes("You're welcome!"));
    fireEvent.click(closeButton!);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('passes characterCount to PostHeader when feedback has content', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'Test',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const postHeader = screen.getByTestId('post-header');
    expect(postHeader).toHaveAttribute('data-character-count', '4');
  });

  it('applies correct className to DialogContent', () => {
    render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);

    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveClass('w-2xl');
  });
});

describe('DialogFeedback - Snapshots', () => {
  const mockOnOpenChange = vi.fn();
  const mockHandleChange = vi.fn();
  const mockSubmit = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUserProfile.mockReturnValue({
      currentUserPubky: 'test-user-123',
    });
  });

  it('matches snapshot for default state', () => {
    mockUseFeedback.mockReturnValue({
      feedback: '',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: false,
      reset: mockReset,
    });

    const { container } = render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with feedback content', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'This is test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    const { container } = render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when submitting', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'This is test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: true,
      isSuccess: false,
      hasContent: true,
      reset: mockReset,
    });

    const { container } = render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for success state', () => {
    mockUseFeedback.mockReturnValue({
      feedback: 'This is test feedback',
      handleChange: mockHandleChange,
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: true,
      hasContent: true,
      reset: mockReset,
    });

    const { container } = render(<DialogFeedback open={true} onOpenChange={mockOnOpenChange} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
