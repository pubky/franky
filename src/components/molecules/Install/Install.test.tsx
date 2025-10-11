import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallCard, InstallHeader, InstallNavigation } from './Install';
import * as App from '@/app';

// Mock Next.js Image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Core
const mockReset = vi.fn();
vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    reset: mockReset,
  }),
}));

describe('InstallCard', () => {
  it('matches snapshot', () => {
    const { container } = render(<InstallCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('InstallHeader', () => {
  it('matches snapshot', () => {
    const { container } = render(<InstallHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('InstallNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<InstallNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('handles create button click', () => {
    render(<InstallNavigation />);

    const createButton = screen.getByRole('button', { name: /Create keys in browser/i });
    fireEvent.click(createButton);

    expect(mockReset).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.PUBKY);
  });

  it('handles continue button click', () => {
    render(<InstallNavigation />);

    const continueButton = screen.getByRole('button', { name: /Continue with Pubky Ring/i });
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.SCAN);
  });
});
