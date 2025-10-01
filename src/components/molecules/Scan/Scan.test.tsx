import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ScanContent, ScanFooter, ScanHeader, ScanNavigation } from './Scan';
import * as Config from '@/config';
import * as App from '@/app';

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
      url: 'mock-auth-url',
      promise: Promise.resolve({ mockKeypair: true }),
    }),
    loginWithAuthUrl: vi.fn().mockResolvedValue({}),
  },
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
  ButtonsNavigation: ({
    onHandleBackButton,
    continueButtonDisabled,
    hiddenContinueButton,
  }: {
    onHandleBackButton: () => void;
    continueButtonDisabled?: boolean;
    hiddenContinueButton?: boolean;
  }) => (
    <div data-testid="buttons-navigation">
      <button data-testid="back-button" onClick={onHandleBackButton}>
        Back
      </button>
      {!hiddenContinueButton && (
        <button data-testid="continue-button" disabled={continueButtonDisabled}>
          Continue
        </button>
      )}
    </div>
  ),
  toast: vi.fn(),
}));

// Mock libs
vi.mock('@/libs', () => ({
  Loader2: ({ className }: { className?: string }) => (
    <svg
      className={className}
      data-testid="loader-icon"
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Key: ({ className }: { className?: string }) => (
    <svg
      className={className}
      data-testid="key-icon"
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({ children, className, size }: { children: React.ReactNode; className?: string; size?: string }) => (
    <button data-testid="button" className={className} data-size={size}>
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
  Link: ({ children, href, target }: { children: React.ReactNode; href: string; target?: string }) => (
    <a data-testid="link" href={href} target={target}>
      {children}
    </a>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
}));

describe('ScanContent', () => {
  it('renders desktop and mobile content containers', async () => {
    await act(async () => {
      render(<ScanContent />);
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

  it('renders logo and button in mobile version', async () => {
    await act(async () => {
      render(<ScanContent />);
    });

    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Authorize with Pubky Ring')).toBeInTheDocument();
    });

    const images = screen.getAllByTestId('next-image');
    const logoImage = images.find((img) => img.getAttribute('src') === '/images/logo-pubky-ring.svg');

    expect(logoImage).toBeInTheDocument();
  });
});

describe('ScanFooter', () => {
  it('renders footer with links', () => {
    render(<ScanFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
  });

  it('renders links', () => {
    render(<ScanFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyRingLink = links[0];
    const pubkyCoreLink = links[1];

    expect(pubkyRingLink).toHaveAttribute('href', Config.PUBKY_RING_URL);
    expect(pubkyCoreLink).toHaveAttribute('href', Config.PUBKY_CORE_URL);
  });
});

describe('ScanHeader', () => {
  it('renders mobile header correctly', () => {
    render(<ScanHeader isMobile={true} />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
  });

  it('renders desktop header correctly', () => {
    render(<ScanHeader isMobile={false} />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
  });
});

describe('ScanNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders buttons navigation with correct configuration', () => {
    render(<ScanNavigation />);

    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.queryByTestId('continue-button')).not.toBeInTheDocument(); // hidden
  });

  it('handles back button click', () => {
    render(<ScanNavigation />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.INSTALL);
  });
});

describe('Scan Components - Snapshots', () => {
  describe('ScanContent - Snapshots', () => {
    it('matches snapshot for default ScanContent', () => {
      const { container } = render(<ScanContent />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ScanFooter - Snapshots', () => {
    it('matches snapshot for default ScanFooter', () => {
      const { container } = render(<ScanFooter />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ScanHeader - Snapshots', () => {
    it('matches snapshot for mobile ScanHeader', () => {
      const { container } = render(<ScanHeader isMobile={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for desktop ScanHeader', () => {
      const { container } = render(<ScanHeader isMobile={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('ScanNavigation - Snapshots', () => {
    it('matches snapshot for default ScanNavigation', () => {
      const { container } = render(<ScanNavigation />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
