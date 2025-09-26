import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallCard, InstallFooter, InstallHeader, InstallNavigation } from './Install';
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
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="next-image" src={src} alt={alt} width={width} height={height} />
  ),
}));

interface ImageProps {
  src: string;
  alt: string;
  size?: string;
}

// Mock molecules
vi.mock('@/molecules', () => ({
  ContentCard: ({ children, image }: { children: React.ReactNode; image?: ImageProps }) => (
    <div data-testid="content-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img data-testid="content-card-image" src={image.src} alt={image.alt} data-size={image.size} />}
      {children}
    </div>
  ),
  StoreButtons: ({ className }: { className?: string }) => (
    <div data-testid="store-buttons" className={className}>
      Store Buttons
    </div>
  ),
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="page-title" data-size={size}>
      {children}
    </div>
  ),
  PopoverTradeoffs: () => <div data-testid="popover-tradeoffs">Tradeoffs Popover</div>,
  DialogDownloadPubkyRing: ({ store }: { store?: string }) => (
    <div data-testid="dialog-download-pubky-ring" data-store={store}>
      Download Dialog
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
  Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="typography" className={className}>
      {children}
    </p>
  ),
  FooterLinks: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="footer-links" className={className}>
      {children}
    </div>
  ),
  Link: ({ children, href, target }: { children: React.ReactNode; href: string; target?: string }) => (
    <a data-testid="link" href={href} target={target}>
      {children}
    </a>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
  Button: ({
    children,
    variant,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={variant ? `button-${variant}` : 'button'}
      className={className}
      onClick={onClick}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  AppWindow: ({ className }: { className?: string }) => (
    <div data-testid="app-window-icon" className={className}>
      AppWindow
    </div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right-icon" className={className}>
      ArrowRight
    </div>
  ),
}));

describe('InstallCard', () => {
  it('renders content card with image', () => {
    render(<InstallCard />);

    expect(screen.getByTestId('content-card')).toBeInTheDocument();
  });
});

describe('InstallFooter', () => {
  it('renders footer links with correct content', () => {
    render(<InstallFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
  });

  it('renders links', () => {
    render(<InstallFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyRingLink = links[0];
    const pubkyCoreLink = links[1];

    expect(pubkyRingLink).toHaveAttribute('href', Config.PUBKY_RING_URL);
    expect(pubkyRingLink).toHaveTextContent('Pubky Ring');
    expect(pubkyCoreLink).toHaveAttribute('href', Config.PUBKY_CORE_URL);
    expect(pubkyCoreLink).toHaveTextContent('Pubky Core');
  });
});

describe('InstallHeader', () => {
  it('renders page header with title and subtitle', () => {
    render(<InstallHeader />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
  });
});

describe('InstallNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation buttons', () => {
    render(<InstallNavigation />);

    expect(screen.getByTestId('button-outline')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('popover-tradeoffs')).toBeInTheDocument();
  });

  it('handles create button click', () => {
    render(<InstallNavigation />);

    const createButton = screen.getByTestId('button-outline');
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.PUBKY);
  });

  it('handles continue button click', () => {
    render(<InstallNavigation />);

    const continueButton = screen.getByTestId('button');
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.SCAN);
  });
});

describe('Install Components - Snapshots', () => {
  describe('InstallCard - Snapshots', () => {
    it('matches snapshot for default InstallCard', () => {
      const { container } = render(<InstallCard />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('InstallFooter - Snapshots', () => {
    it('matches snapshot for default InstallFooter', () => {
      const { container } = render(<InstallFooter />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('InstallHeader - Snapshots', () => {
    it('matches snapshot for default InstallHeader', () => {
      const { container } = render(<InstallHeader />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('InstallNavigation - Snapshots', () => {
    it('matches snapshot for default InstallNavigation', () => {
      const { container } = render(<InstallNavigation />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for InstallNavigation with custom className', () => {
      const { container } = render(<InstallNavigation className="custom-navigation" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
