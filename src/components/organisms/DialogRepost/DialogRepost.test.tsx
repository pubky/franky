import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogRepost } from './DialogRepost';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';

// Mock Radix UI Dialog components
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

// Mock organisms
vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId }: { postId: string }) => (
    <div data-testid="post-header" data-post-id={postId}>
      PostHeader {postId}
    </div>
  )),
  PostContent: vi.fn(({ postId }: { postId: string }) => (
    <div data-testid="post-content" data-post-id={postId}>
      PostContent {postId}
    </div>
  )),
  PostInput: vi.fn(
    ({
      variant,
      originalPostId,
      onSuccess,
      showThreadConnector,
    }: {
      variant: string;
      originalPostId: string;
      onSuccess?: () => void;
      showThreadConnector?: boolean;
    }) => (
      <div
        data-testid="post-input"
        data-variant={variant}
        data-original-post-id={originalPostId}
        data-show-thread={showThreadConnector}
      >
        <button data-testid="mock-success-btn" onClick={onSuccess}>
          Success
        </button>
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
    'aria-describedby': ariaDescribedBy,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
    'aria-describedby'?: string;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="dialog-content"
      className={className}
      aria-label={hiddenTitle}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
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
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Use real libs, only stub cn to a deterministic join
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('DialogRepost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Repost');
    expect(screen.getByTestId('post-input')).toBeInTheDocument();
  });

  it('renders PostInput with originalPostId for repost preview', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    // PostHeader and PostContent are now rendered inside PostInput for repost preview
    expect(Organisms.PostInput).toHaveBeenCalledWith(
      {
        variant: POST_INPUT_VARIANT.REPOST,
        originalPostId: 'test-post-123',
        onSuccess: expect.any(Function),
        showThreadConnector: false,
        expanded: true,
        hideArticle: true,
      },
      undefined,
    );
  });

  it('renders PostInput with correct props', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    expect(Organisms.PostInput).toHaveBeenCalledWith(
      {
        variant: POST_INPUT_VARIANT.REPOST,
        originalPostId: 'test-post-123',
        onSuccess: expect.any(Function),
        showThreadConnector: false,
        expanded: true,
        hideArticle: true,
      },
      undefined,
    );
  });

  it('passes onOpenChangeAction to Dialog', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={true} onOpenChangeAction={onOpenChangeAction} />);

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'true');
  });

  it('calls onOpenChangeAction when PostInput onSuccess is called', async () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    const successButton = screen.getByTestId('mock-success-btn');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(onOpenChangeAction).toHaveBeenCalledWith(false);
    });
  });

  it('applies correct className to DialogContent', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveClass('w-3xl');
  });

  it('sets hiddenTitle on DialogContent', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    const dialogContent = screen.getByTestId('dialog-content');
    expect(dialogContent).toHaveAttribute('aria-label', 'Repost');
  });

  it('renders DialogHeader with title', () => {
    const onOpenChangeAction = vi.fn();
    render(<DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />);

    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Repost');
  });

  it('handles open prop correctly', () => {
    const onOpenChangeAction = vi.fn();
    const { rerender } = render(
      <DialogRepost postId="test-post-123" open={false} onOpenChangeAction={onOpenChangeAction} />,
    );

    let dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'false');

    rerender(<DialogRepost postId="test-post-123" open={true} onOpenChangeAction={onOpenChangeAction} />);
    dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-open', 'true');
  });
});

describe('DialogRepost - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot with default props', () => {
    const onOpenChangeAction = vi.fn();
    const { container } = render(
      <DialogRepost postId="snapshot-post-id" open={false} onOpenChangeAction={onOpenChangeAction} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with open prop', () => {
    const onOpenChangeAction = vi.fn();
    const { container } = render(
      <DialogRepost postId="snapshot-post-id" open={true} onOpenChangeAction={onOpenChangeAction} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
