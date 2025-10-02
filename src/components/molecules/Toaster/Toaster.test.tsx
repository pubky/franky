import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Toaster } from './Toaster';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
    return (
      <div data-testid="sonner-toaster" {...props}>
        {children}
      </div>
    );
  },
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
  let mockUseTheme: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked useTheme function
    const nextThemes = await vi.importMock('next-themes');
    mockUseTheme = vi.mocked(nextThemes.useTheme) as ReturnType<typeof vi.fn>;

    // Default theme mock
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render Sonner toaster', () => {
      const { container } = render(<Toaster />);

      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
      expect(container.firstChild).toBeTruthy();
    });

    it('should render with correct props', () => {
      render(<Toaster />);

      const sonnerToaster = screen.getByTestId('sonner-toaster');
      expect(sonnerToaster).toBeInTheDocument();
      expect(sonnerToaster).toHaveAttribute('theme', 'light');
      expect(sonnerToaster).toHaveAttribute('position', 'bottom-center');
      expect(sonnerToaster).toHaveAttribute('class', 'toaster group');
    });
  });

  describe('Error Handling', () => {
    it('should handle useTheme throwing an error', () => {
      mockUseTheme.mockImplementation(() => {
        throw new Error('Theme provider error');
      });

      expect(() => render(<Toaster />)).toThrow('Theme provider error');
    });

    it('should handle useTheme returning undefined', () => {
      mockUseTheme.mockReturnValue(undefined);

      expect(() => render(<Toaster />)).toThrow();
    });
  });

  describe('Multiple Renders', () => {
    it('should handle multiple renders consistently', () => {
      const { rerender } = render(<Toaster />);
      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();

      rerender(<Toaster />);
      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
    });

    it('should maintain consistent props across renders', () => {
      const { rerender } = render(<Toaster />);
      const firstRender = screen.getByTestId('sonner-toaster');

      rerender(<Toaster />);
      const secondRender = screen.getByTestId('sonner-toaster');

      expect(firstRender.getAttribute('theme')).toBe(secondRender.getAttribute('theme'));
      expect(firstRender.getAttribute('position')).toBe(secondRender.getAttribute('position'));
      expect(firstRender.getAttribute('class')).toBe(secondRender.getAttribute('class'));
    });
  });

  describe('Toast Interaction Scenarios', () => {
    it('should handle theme changes during component lifecycle', () => {
      const { rerender } = render(<Toaster />);

      // Change theme
      mockUseTheme.mockReturnValue({
        theme: 'dark',
        setTheme: vi.fn(),
      });

      rerender(<Toaster />);

      const sonnerToaster = screen.getByTestId('sonner-toaster');
      expect(sonnerToaster).toHaveAttribute('theme', 'dark');
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple renders', () => {
      const { rerender, unmount } = render(<Toaster />);

      // Multiple renders
      for (let i = 0; i < 10; i++) {
        rerender(<Toaster />);
      }

      expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();

      // Should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});

describe('Toaster - Snapshots', () => {
  let mockUseTheme: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked useTheme function
    const nextThemes = await vi.importMock('next-themes');
    mockUseTheme = vi.mocked(nextThemes.useTheme) as ReturnType<typeof vi.fn>;

    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });
  });

  it('matches snapshot for Toaster with light theme', () => {
    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Toaster with system theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'system',
      setTheme: vi.fn(),
    });

    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
