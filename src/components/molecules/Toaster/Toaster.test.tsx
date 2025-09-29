import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from './Toaster';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="sonner-toaster" {...props}>
      {children}
    </div>
  ),
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

  it('should render Sonner toaster', () => {
    const { container } = render(<Toaster />);

    // Should render Sonner toaster
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });

  it('should render with correct props', () => {
    render(<Toaster />);

    const sonnerToaster = screen.getByTestId('sonner-toaster');
    expect(sonnerToaster).toBeInTheDocument();
    expect(sonnerToaster).toHaveAttribute('class', 'toaster group');
  });
});

describe('Toaster - Snapshots', () => {
  it('matches snapshot for Toaster', () => {
    const { container } = render(<Toaster />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
