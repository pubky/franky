import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallCard, InstallFooter, InstallHeader, InstallNavigation } from './Install';

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

    const image = screen.getByTestId('content-card-image');
    expect(image).toHaveAttribute('src', '/images/keyring.png');
    expect(image).toHaveAttribute('alt', 'Keyring');
  });

  it('renders Pubky Ring logo', () => {
    render(<InstallCard />);

    const logo = screen.getByTestId('next-image');
    expect(logo).toHaveAttribute('src', '/images/logo-pubky-ring.svg');
    expect(logo).toHaveAttribute('alt', 'Pubky Ring');
    expect(logo).toHaveAttribute('width', '220');
    expect(logo).toHaveAttribute('height', '48');
  });

  it('renders description text', () => {
    render(<InstallCard />);

    expect(screen.getByText('Download and install the mobile app to start creating your account.')).toBeInTheDocument();
  });

  it('renders store buttons', () => {
    render(<InstallCard />);

    expect(screen.getAllByTestId('dialog-download-pubky-ring')).toHaveLength(2);
  });
});

describe('InstallFooter', () => {
  it('renders footer links with correct content', () => {
    render(<InstallFooter />);

    expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    expect(screen.getByText('Use', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('or any other', { exact: false })).toBeInTheDocument();
    expect(
      screen.getByText('–powered keychain, or create your keys in the browser (less secure).', { exact: false }),
    ).toBeInTheDocument();
  });

  it('renders Pubky Ring link', () => {
    render(<InstallFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyRingLink = links[0];

    expect(pubkyRingLink).toHaveAttribute('href', 'https://pubkyring.app/');
    expect(pubkyRingLink).toHaveAttribute('target', '_blank');
    expect(pubkyRingLink).toHaveTextContent('Pubky Ring');
  });

  it('renders Pubky Core link', () => {
    render(<InstallFooter />);

    const links = screen.getAllByTestId('link');
    const pubkyCoreLink = links[1];

    expect(pubkyCoreLink).toHaveAttribute('href', 'https://pubky.org');
    expect(pubkyCoreLink).toHaveAttribute('target', '_blank');
    expect(pubkyCoreLink).toHaveTextContent('Pubky Core');
  });

  it('has correct footer styling', () => {
    render(<InstallFooter />);

    const footer = screen.getByTestId('footer-links');
    expect(footer.className).toContain('py-6');
  });
});

describe('InstallHeader', () => {
  it('renders page header with title and subtitle', () => {
    render(<InstallHeader />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
  });

  it('renders correct title with brand styling', () => {
    render(<InstallHeader />);

    const title = screen.getByTestId('page-title');
    expect(title).toHaveAttribute('data-size', 'large');
    expect(title).toHaveTextContent('Install Pubky Ring.');
  });

  it('renders correct subtitle', () => {
    render(<InstallHeader />);

    expect(
      screen.getByText('Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.'),
    ).toBeInTheDocument();
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

    expect(mockPush).toHaveBeenCalledWith('/onboarding/pubky');
  });

  it('handles continue button click', () => {
    render(<InstallNavigation />);

    const continueButton = screen.getByTestId('button');
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith('/onboarding/scan');
  });

  it('renders correct button text', () => {
    render(<InstallNavigation />);

    expect(screen.getByText('Create keys in browser')).toBeInTheDocument();
    expect(screen.getByText('Continue with Pubky Ring')).toBeInTheDocument();
  });

  it('has correct container layout', () => {
    render(<InstallNavigation />);

    const containers = screen.getAllByTestId('container');
    expect(containers[0].className).toContain('flex-col-reverse md:flex-row gap-3 lg:gap-6');
    expect(containers[1].className).toContain('items-center gap-1 flex-row');
  });

  it('applies custom className', () => {
    render(<InstallNavigation className="custom-class" />);

    const mainContainer = screen.getAllByTestId('container')[0];
    expect(mainContainer.className).toContain('custom-class');
  });
});
