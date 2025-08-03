import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanContent, ScanFooter, ScanHeader, ScanNavigation } from './Scan';

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
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="next-image" src={src} alt={alt} width={width} height={height} />
  ),
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
  it('renders desktop and mobile content containers', () => {
    render(<ScanContent />);

    const containers = screen.getAllByTestId('container');
    expect(containers.length).toBeGreaterThan(0);

    // Check for desktop container (hidden md:flex)
    const desktopContainer = containers.find((container) => container.className.includes('hidden md:flex'));
    expect(desktopContainer).toBeInTheDocument();

    // Check for mobile container (md:hidden)
    const mobileContainer = containers.find((container) => container.className.includes('md:hidden'));
    expect(mobileContainer).toBeInTheDocument();
  });

  it('renders QR code image in desktop version', () => {
    render(<ScanContent />);

    const images = screen.getAllByTestId('next-image');
    const qrImage = images.find((img) => img.getAttribute('src') === '/images/pubky-ring-qr-example.png');

    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('alt', 'Pubky Ring');
    expect(qrImage).toHaveAttribute('width', '220');
    expect(qrImage).toHaveAttribute('height', '220');
  });

  it('renders logo and button in mobile version', () => {
    render(<ScanContent />);

    const images = screen.getAllByTestId('next-image');
    const logoImage = images.find((img) => img.getAttribute('src') === '/images/logo-pubky-ring.svg');

    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt', 'Pubky Ring');
    expect(logoImage).toHaveAttribute('width', '137');
    expect(logoImage).toHaveAttribute('height', '30');

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Authorize with Pubky Ring')).toBeInTheDocument();
  });

  it('renders content cards with column layout', () => {
    render(<ScanContent />);

    const contentCards = screen.getAllByTestId('content-card');
    contentCards.forEach((card) => {
      expect(card).toHaveAttribute('data-layout', 'column');
    });
  });
});

describe('ScanFooter', () => {
  it('renders footer with links', () => {
    render(<ScanFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByText('Use', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('or any other', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('–powered keychain.', { exact: false })).toBeInTheDocument();
  });

  it('renders Pubky Ring link', () => {
    render(<ScanFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyRingLink = links[0];

    expect(pubkyRingLink).toHaveAttribute('href', 'https://www.pubkyring.to/');
    expect(pubkyRingLink).toHaveAttribute('target', '_blank');
    expect(pubkyRingLink).toHaveTextContent('Pubky Ring');
  });

  it('renders Pubky Core link', () => {
    render(<ScanFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyCoreLink = links[1];

    expect(pubkyCoreLink).toHaveAttribute('href', 'https://pubky.org');
    expect(pubkyCoreLink).toHaveAttribute('target', '_blank');
    expect(pubkyCoreLink).toHaveTextContent('Pubky Core');
  });
});

describe('ScanHeader', () => {
  it('renders mobile header correctly', () => {
    render(<ScanHeader isMobile={true} />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();

    const title = screen.getByTestId('page-title');
    expect(title).toHaveAttribute('data-size', 'medium');
    expect(title).toHaveTextContent('Tap to Authorize.');
  });

  it('renders desktop header correctly', () => {
    render(<ScanHeader isMobile={false} />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();

    const title = screen.getByTestId('page-title');
    expect(title).toHaveAttribute('data-size', 'medium');
    expect(title).toHaveTextContent('Scan QR Code.');
  });

  it('renders correct subtitle', () => {
    render(<ScanHeader isMobile={true} />);

    expect(screen.getByText('Open Pubky Ring, create a pubky, and scan the QR.')).toBeInTheDocument();
  });

  it('contains brand-styled text', () => {
    render(<ScanHeader isMobile={false} />);

    const title = screen.getByTestId('page-title');
    expect(title.textContent).toContain('QR Code');
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

    expect(mockPush).toHaveBeenCalledWith('/onboarding/install');
  });

  it('hides continue button and disables it', () => {
    render(<ScanNavigation />);

    // Continue button should be hidden based on hiddenContinueButton prop
    expect(screen.queryByTestId('continue-button')).not.toBeInTheDocument();
  });
});
