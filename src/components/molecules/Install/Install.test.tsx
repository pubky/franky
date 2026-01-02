import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallCard, InstallHeader, InstallNavigation } from './Install';
import * as App from '@/app';

// Helper function to normalize Radix UI IDs for snapshot testing
const normalizeRadixIds = (html: string): string => {
  // Create a map to track ID replacements
  const idMap = new Map<string, string>();
  let counter = 0;

  return html.replace(/radix-«r[0-9a-z]+»/gi, (match) => {
    if (!idMap.has(match)) {
      idMap.set(match, `radix-«r${counter}»`);
      counter++;
    }
    return idMap.get(match)!;
  });
};

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
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useOnboardingStore: () => ({
      reset: mockReset,
    }),
  };
});

describe('InstallCard', () => {
  it('matches snapshot', () => {
    const { container } = render(<InstallCard />);
    const normalizedHtml = normalizeRadixIds(container.innerHTML);
    expect(normalizedHtml).toMatchSnapshot();
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
    const normalizedHtml = normalizeRadixIds(container.innerHTML);
    expect(normalizedHtml).toMatchSnapshot();
  });

  it('handles create button click', () => {
    render(<InstallNavigation />);

    const createButton = screen.getByRole('button', { name: /Create keys in browser/i });
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.PUBKY);
  });

  it('handles continue button click', () => {
    render(<InstallNavigation />);

    const continueButton = screen.getByRole('button', { name: /Continue with Pubky Ring/i });
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.SCAN);
  });
});
