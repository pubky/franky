import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mobile and desktop Toasters', () => {
    render(<Toaster />);

    const toasters = screen.getAllByTestId('sonner-toaster');
    expect(toasters).toHaveLength(2);

    // Mobile toaster: top-center, offset 88
    const mobileToaster = toasters.find((t) => t.getAttribute('data-position') === 'top-center');
    expect(mobileToaster).toBeInTheDocument();
    expect(mobileToaster).toHaveAttribute('data-offset', '88');
    expect(mobileToaster).toHaveClass('toaster-mobile');

    // Desktop toaster: bottom-center, offset 80
    const desktopToaster = toasters.find((t) => t.getAttribute('data-position') === 'bottom-center');
    expect(desktopToaster).toBeInTheDocument();
    expect(desktopToaster).toHaveAttribute('data-offset', '80');
    expect(desktopToaster).toHaveClass('toaster-desktop');
  });
});

describe('Toaster - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Toaster />);
    expect(container).toMatchSnapshot();
  });
});
