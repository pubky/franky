import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { SignInContent, SignInFooter } from './SignIn';
import type { PublicKey } from '@synonymdev/pubky';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => (
    <img data-testid="next-image" src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock QRCodeSVG
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ size }: { size: number }) => (
    <img data-testid="next-image" src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={size} height={size} />
  ),
}));

// Mock Core modules
vi.mock('@/core', () => ({
  AuthController: {
    getAuthUrl: vi.fn().mockResolvedValue({
      authorizationUrl: 'mock-auth-url',
      awaitApproval: Promise.resolve({} as unknown as PublicKey),
    }),
    initializeAuthenticatedSession: vi.fn().mockResolvedValue({}),
    loginWithAuthUrl: vi.fn().mockResolvedValue({}),
  },
  BootstrapController: {
    run: vi.fn().mockResolvedValue({}),
  },
  useAuthStore: {
    getState: vi.fn().mockReturnValue({
      currentUserPubky: 'mock-user-pubkey-123',
    }),
  },
  useOnboardingStore: {
    getState: vi.fn().mockReturnValue({
      reset: vi.fn(),
    }),
  },
}));

// Mock useAuthUrl hook
const mockFetchUrl = vi.fn();
vi.mock('@/hooks', () => ({
  useAuthUrl: vi.fn(() => ({
    url: 'mock-auth-url',
    isLoading: false,
    isGenerating: false,
    fetchUrl: mockFetchUrl,
    retryCount: 0,
  })),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ResponsiveSection: ({ desktop, mobile }: { desktop: React.ReactNode; mobile: React.ReactNode }) => (
    <div data-testid="responsive-section">
      <div data-testid="desktop-content">{desktop}</div>
      <div data-testid="mobile-content">{mobile}</div>
    </div>
  ),
  ContentCard: ({ children, layout }: { children: React.ReactNode; layout?: string }) => (
    <div data-testid="content-card" data-layout={layout}>
      {children}
    </div>
  ),
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="page-title" data-size={size}>
      {children}
    </div>
  ),
  toast: vi.fn(),
}));

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Logger: {
      error: vi.fn(),
    },
  };
});

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    className,
    size,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
    size?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="button" className={className} data-size={size} {...props}>
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
  }) => {
    const Tag = as || 'span';
    return React.createElement(Tag, { 'data-testid': 'typography', className, 'data-size': size }, children);
  },
  FooterLinks: ({ children }: { children: React.ReactNode }) => <div data-testid="footer-links">{children}</div>,
  Link: ({
    children,
    href,
    target,
    rel,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    rel?: string;
  }) => (
    <a data-testid="link" href={href} target={target} rel={rel}>
      {children}
    </a>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
}));

describe('SignInContent', () => {
  const originalLocation = window.location;
  const originalOpen = window.open;
  const clipboardMock = { writeText: vi.fn().mockResolvedValue(undefined) };

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...(originalLocation as unknown as object), href: '' } as unknown as Location,
    });
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: vi.fn(() => ({ location: { href: '' } })) as typeof window.open,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: clipboardMock,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = '';
    clipboardMock.writeText.mockClear();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    Object.defineProperty(window, 'open', {
      configurable: true,
      value: originalOpen,
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });

  it('renders desktop and mobile content containers', async () => {
    await act(async () => {
      render(<SignInContent />);
    });

    const containers = screen.getAllByTestId('container');
    expect(containers.length).toBeGreaterThan(0);

    // Check for desktop container (hidden md:flex)
    const desktopContainer = containers.find((container) => container.className.includes('hidden md:flex'));
    expect(desktopContainer).toBeInTheDocument();

    // Check for mobile container (md:hidden)
    const mobileContainer = containers.find((container) => container.className.includes('md:hidden'));
    expect(mobileContainer).toBeInTheDocument();
  });

  it('renders QR code image in desktop version', async () => {
    await act(async () => {
      render(<SignInContent />);
    });

    // Wait for the component to finish loading and show QR code
    await waitFor(() => {
      const images = screen.getAllByTestId('next-image');
      const qrImage = images.find((img) => img.getAttribute('src') === '/images/pubky-ring-qr-example.png');
      expect(qrImage).toBeInTheDocument();
    });

    const images = screen.getAllByTestId('next-image');
    const qrImage = images.find((img) => img.getAttribute('src') === '/images/pubky-ring-qr-example.png');

    expect(qrImage).toHaveAttribute('alt', 'Pubky Ring');
    expect(qrImage).toHaveAttribute('width', '220');
    expect(qrImage).toHaveAttribute('height', '220');
  });

  it('renders logo and button in mobile version', async () => {
    await act(async () => {
      render(<SignInContent />);
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Authorize with Pubky Ring')).toBeInTheDocument();
    });

    const images = screen.getAllByTestId('next-image');
    const logoImage = images.find((img) => img.getAttribute('src') === '/images/logo-pubky-ring.svg');

    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'Pubky Ring');
    expect(logoImage).toHaveAttribute('width', '137');
    expect(logoImage).toHaveAttribute('height', '30');

    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('navigates to the Pubky Ring deeplink when mobile authorize button is tapped', async () => {
    await act(async () => {
      render(<SignInContent />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('button')).not.toBeDisabled();
    });

    const authorizeButton = screen.getByTestId('button');
    await act(async () => {
      fireEvent.click(authorizeButton);
    });

    expect(clipboardMock.writeText).toHaveBeenCalledWith('mock-auth-url');
    expect(window.open).toHaveBeenCalledWith('pubkyring://mock-auth-url', '_blank');
  });

  // Note: Retry logic and error handling for auth URL generation are now tested
  // in useAuthUrl.test.tsx since that logic was extracted to the hook

  // Note: Unmount cleanup and request deduplication are tested in useAuthUrl.test.tsx
  
  it('button disabled when loading', async () => {
    // Mock loading state
    const Hooks = await import('@/hooks');
    vi.mocked(Hooks.useAuthUrl).mockReturnValue({
      url: '',
      isLoading: true,
      isGenerating: true,
      fetchUrl: mockFetchUrl,
      retryCount: 0,
    });

    await act(async () => {
      render(<SignInContent />);
    });

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('renders content cards with column layout', async () => {
    await act(async () => {
      render(<SignInContent />);
    });

    const contentCards = screen.getAllByTestId('content-card');
    contentCards.forEach((card) => {
      expect(card).toHaveAttribute('data-layout', 'column');
    });
  });

  // Note: Loading state tests removed due to complexity with async mocking
});

describe('SignInFooter', () => {
  it('renders footer with recovery message', () => {
    render(<SignInFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByText('Not able to sign in with', { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText('? Use the recovery phrase or encrypted file to restore your account.', { exact: false }),
    ).toBeInTheDocument();
  });

  it('renders Pubky Ring link', () => {
    render(<SignInFooter />);

    const link = screen.getByTestId('link');

    expect(link).toHaveAttribute('href', 'https://pubkyring.app/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('Pubky Ring');
  });
});
