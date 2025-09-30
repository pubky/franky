import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from './Toaster';

// Mock the useToast hook
const mockUseToast = vi.fn();
vi.mock('./use-toast', () => ({
  useToast: () => mockUseToast(),
}));

// Mock @/libs to intercept any icons and utilities
vi.mock('@/libs', () => ({
  X: () => <svg data-testid="x-icon" />,
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

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty when no toasts', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
    });

    const { container } = render(<Toaster />);

    // Should render ToastProvider structure even with no toasts
    expect(container.firstChild).toBeTruthy();
  });

  it('should render toast without title when only description is provided', () => {
    const mockToast = {
      id: '1',
      description: 'Just a description',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('Just a description')).toBeInTheDocument();
  });

  it('should handle complex toast with action button click', () => {
    const handleActionClick = vi.fn();
    const mockAction = (
      <button data-testid="toast-action" onClick={handleActionClick}>
        Retry
      </button>
    );

    const mockToast = {
      id: 'complex-toast',
      title: 'Upload Failed',
      description: 'There was an error uploading your file. Please try again.',
      action: mockAction,
      className: 'bg-red-500 border-red-600',
      'data-testid': 'error-toast',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    // Check all elements are rendered
    expect(screen.getByText('Upload Failed')).toBeInTheDocument();
    expect(screen.getByText('There was an error uploading your file. Please try again.')).toBeInTheDocument();
    expect(screen.getByTestId('toast-action')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();

    // Check custom props are applied
    const toastElement = screen.getByTestId('error-toast');
    expect(toastElement).toBeInTheDocument();

    // Test action button functionality
    fireEvent.click(screen.getByTestId('toast-action'));
    expect(handleActionClick).toHaveBeenCalledTimes(1);
  });
});

describe('Toaster - Snapshots', () => {
  it('matches snapshot for empty Toaster', () => {
    mockUseToast.mockReturnValue({
      toasts: [],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with single toast', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Test Toast',
          description: 'This is a test toast message',
          open: true,
        },
      ],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with title-only toast', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Simple Toast',
          open: true,
        },
      ],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with toast with action', () => {
    const mockAction = (
      <button data-testid="custom-action" onClick={() => {}}>
        Undo
      </button>
    );

    const mockToast = {
      id: '1',
      title: 'Toast with Action',
      description: 'This toast has an action button',
      action: mockAction,
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with toast action', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Toast with Action',
          description: 'This toast has an action button',
          action: <button>Undo</button>,
          open: true,
        },
      ],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with multiple toasts', () => {
    mockUseToast.mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'First Toast',
          description: 'First description',
          open: true,
        },
        {
          id: '2',
          title: 'Second Toast',
          description: 'Second description',
          open: true,
        },
      ],
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
