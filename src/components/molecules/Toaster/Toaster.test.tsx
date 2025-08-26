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

  it('should render single toast with title only', () => {
    const mockToast = {
      id: '1',
      title: 'Test Title',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render toast with title and description', () => {
    const mockToast = {
      id: '1',
      title: 'Success',
      description: 'Operation completed successfully',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('should render toast with action button', () => {
    const mockAction = (
      <button data-testid="custom-action" onClick={() => {}}>
        Undo
      </button>
    );

    const mockToast = {
      id: '1',
      title: 'File deleted',
      description: 'Your file has been deleted',
      action: mockAction,
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('File deleted')).toBeInTheDocument();
    expect(screen.getByText('Your file has been deleted')).toBeInTheDocument();
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    const mockToasts = [
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
    ];

    mockUseToast.mockReturnValue({
      toasts: mockToasts,
    });

    render(<Toaster />);

    expect(screen.getByText('First Toast')).toBeInTheDocument();
    expect(screen.getByText('First description')).toBeInTheDocument();
    expect(screen.getByText('Second Toast')).toBeInTheDocument();
    expect(screen.getByText('Second description')).toBeInTheDocument();
  });

  it('should render toast without description when only title is provided', () => {
    const mockToast = {
      id: '1',
      title: 'Simple Toast',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('Simple Toast')).toBeInTheDocument();

    // Description should not be rendered
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
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

  it('should handle toast with custom props', () => {
    const mockToast = {
      id: '1',
      title: 'Custom Toast',
      className: 'custom-toast-class',
      'data-testid': 'custom-toast',
      open: true,
    };

    mockUseToast.mockReturnValue({
      toasts: [mockToast],
    });

    render(<Toaster />);

    expect(screen.getByText('Custom Toast')).toBeInTheDocument();
    expect(screen.getByTestId('custom-toast')).toBeInTheDocument();
  });

  it('should handle complex toast with action button functionality', () => {
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
