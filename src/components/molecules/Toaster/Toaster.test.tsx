import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toaster } from './Toaster';

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ position, offset, className }: { position: string; offset: number; className?: string }) => (
    <div data-testid="sonner-toaster" data-position={position} data-offset={offset} className={className} />
  ),
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe('Toaster', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();

    matchMediaMock = vi.fn().mockReturnValue({
      matches: false, // Default to mobile
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render a single Toaster', () => {
    render(<Toaster />);

    const toasters = screen.getAllByTestId('sonner-toaster');
    expect(toasters).toHaveLength(1);
  });

  it('should render with mobile position by default (viewport < 1024px)', () => {
    render(<Toaster />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'top-center');
    expect(toaster).toHaveAttribute('data-offset', '96');
  });

  it('should render with desktop position on large viewports', () => {
    matchMediaMock.mockReturnValue({
      matches: true, // Desktop
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    render(<Toaster />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'bottom-center');
    expect(toaster).toHaveAttribute('data-offset', '80');
  });

  it('should respond to viewport changes', () => {
    render(<Toaster />);

    // Verify listener was added
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));

    // Simulate viewport change to desktop
    const changeHandler = addEventListenerMock.mock.calls[0][1];
    act(() => {
      changeHandler({ matches: true });
    });

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-position', 'bottom-center');
  });

  it('should have z-50 class for proper stacking', () => {
    render(<Toaster />);

    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveClass('z-50');
  });
});

describe('Toaster - Snapshots', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it('matches snapshot for mobile', () => {
    const { container } = render(<Toaster />);
    expect(container).toMatchSnapshot();
  });
});
