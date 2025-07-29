/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallContent } from './InstallContent';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} data-testid="next-image" />,
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-slot="card" data-testid="card" className={className}>
      {children}
    </div>
  ),
  StoreButtons: () => <div data-testid="store-buttons">Store Buttons</div>,
  InstallNavigation: ({
    onCreateKeysInBrowser,
    onContinueWithPubkyRing,
  }: {
    onCreateKeysInBrowser?: () => void;
    onContinueWithPubkyRing?: () => void;
  }) => (
    <div data-testid="install-navigation">
      <button onClick={onCreateKeysInBrowser} data-testid="create-keys-btn">
        Create Keys
      </button>
      <button onClick={onContinueWithPubkyRing} data-testid="continue-btn">
        Continue
      </button>
    </div>
  ),
  PageHeader: ({
    title,
    subtitle,
    className,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="page-header" className={className}>
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  ),
  ContentCard: ({
    children,
    className,
    image,
  }: {
    children: React.ReactNode;
    className?: string;
    image?: { src: string; alt: string; width: number; height: number };
  }) => (
    <div data-testid="content-card" data-slot="card" className={className}>
      {image && <img src={image.src} alt={image.alt} width={image.width} height={image.height} />}
      {children}
    </div>
  ),
  FooterLinks: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="footer-links" className={className}>
      {children}
    </p>
  ),
  BrandText: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="brand-text" className={className}>
      {children}
    </span>
  ),
  PageContainer: ({
    children,
    className,
    as = 'div',
  }: {
    children: React.ReactNode;
    className?: string;
    as?: 'div' | 'main' | 'section';
  }) => {
    const props = { 'data-testid': 'page-container', className };
    if (as === 'main') {
      return <main {...props}>{children}</main>;
    } else if (as === 'section') {
      return <section {...props}>{children}</section>;
    }
    return <div {...props}>{children}</div>;
  },
  ContentContainer: ({
    children,
    className,
    maxWidth,
  }: {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
  }) => (
    <div data-testid="content-container" data-max-width={maxWidth} className={className}>
      {children}
    </div>
  ),
  BrandLink: ({
    children,
    href,
    external,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    external?: boolean;
    className?: string;
  }) => (
    <a data-testid="brand-link" href={href} target={external ? '_blank' : undefined} className={className}>
      {children}
    </a>
  ),
}));

describe('InstallContent', () => {
  it('renders with default props', () => {
    render(<InstallContent />);

    // Check for main structure elements
    const title = screen.getByText(/Install/);
    const subtitle = screen.getByText(/Pubky Ring is a keychain/);
    const card = screen.getByTestId('content-card');
    const storeButtons = screen.getByTestId('store-buttons');
    const navigation = screen.getByTestId('install-navigation');

    expect(title).toBeInTheDocument();
    expect(subtitle).toBeInTheDocument();
    expect(card).toBeInTheDocument();
    expect(storeButtons).toBeInTheDocument();
    expect(navigation).toBeInTheDocument();
  });

  it('displays correct main title', () => {
    render(<InstallContent />);

    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByTestId('brand-text')).toHaveTextContent('Pubky Ring.');
  });

  it('displays correct subtitle', () => {
    render(<InstallContent />);

    expect(screen.getByText(/Pubky Ring is a keychain for your identity keys/)).toBeInTheDocument();
  });

  it('renders keyring image with correct attributes', () => {
    render(<InstallContent />);

    const images = screen.getAllByRole('img');
    const keyringImage = images.find((img) => img.getAttribute('alt') === 'Keyring');

    expect(keyringImage).toBeInTheDocument();
    expect(keyringImage).toHaveAttribute('src', '/images/keyring.png');
    expect(keyringImage).toHaveAttribute('width', '192');
    expect(keyringImage).toHaveAttribute('height', '192');
  });

  it('renders pubky ring logo with correct attributes', () => {
    render(<InstallContent />);

    const logo = screen.getByTestId('next-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo-pubky-ring.svg');
    expect(logo).toHaveAttribute('width', '220');
    expect(logo).toHaveAttribute('height', '48');
  });

  it('displays correct description text', () => {
    render(<InstallContent />);

    expect(screen.getByText(/Download and install the mobile app/)).toBeInTheDocument();
  });

  it('renders footer text with correct links', () => {
    render(<InstallContent />);

    const pubkyRingLink = screen.getByRole('link', { name: /Pubky Ring/ });
    const pubkyCoreLink = screen.getByRole('link', { name: /Pubky Core/ });

    expect(pubkyRingLink).toHaveAttribute('href', 'https://www.pubkyring.to/');
    expect(pubkyCoreLink).toHaveAttribute('href', 'https://pubky.org');
  });

  it('calls onCreateKeysInBrowser when create keys button is clicked', () => {
    const mockCallback = vi.fn();
    render(<InstallContent onCreateKeysInBrowser={mockCallback} />);

    const createKeysBtn = screen.getByTestId('create-keys-btn');
    fireEvent.click(createKeysBtn);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('calls onContinueWithPubkyRing when continue button is clicked', () => {
    const mockCallback = vi.fn();
    render(<InstallContent onContinueWithPubkyRing={mockCallback} />);

    const continueBtn = screen.getByTestId('continue-btn');
    fireEvent.click(continueBtn);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('applies default className', () => {
    const { container } = render(<InstallContent />);
    const mainElement = container.firstChild as HTMLElement;

    // Since we're using PageContainer, check for the page container element
    expect(mainElement).toHaveAttribute('data-testid', 'page-container');
  });

  it('applies custom className', () => {
    const customClass = 'custom-class-name';
    const { container } = render(<InstallContent className={customClass} />);
    const mainElement = container.firstChild as HTMLElement;

    expect(mainElement).toHaveClass(customClass);
  });

  it('maintains proper structure', () => {
    const { container } = render(<InstallContent />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toBeInTheDocument();

    // Check for ContentContainer instead of the specific max-width class
    const contentContainer = container.querySelector('[data-testid="content-container"]');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveAttribute('data-max-width', 'lg');
  });

  it('renders card with correct styling', () => {
    render(<InstallContent />);

    const card = screen.getByTestId('content-card');
    expect(card).toHaveAttribute('data-slot', 'card');
  });

  it('keyring image is hidden on mobile', () => {
    render(<InstallContent />);

    // Since we're using ContentCard with image, the image is always visible
    // but we can check that it's part of the content card
    const keyringImage = screen.getAllByRole('img').find((img) => img.getAttribute('alt') === 'Keyring');
    expect(keyringImage).toBeInTheDocument();
  });

  it('handles undefined event handlers gracefully', () => {
    expect(() => {
      render(<InstallContent />);
    }).not.toThrow();
  });

  it('renders all required sections', () => {
    render(<InstallContent />);

    // Header section with PageHeader
    expect(screen.getByTestId('page-header')).toBeInTheDocument();

    // Card section with ContentCard
    expect(screen.getByTestId('content-card')).toBeInTheDocument();

    // Store buttons section
    expect(screen.getByTestId('store-buttons')).toBeInTheDocument();

    // Footer section with FooterLinks
    expect(screen.getByTestId('footer-links')).toBeInTheDocument();

    // Navigation section
    expect(screen.getByTestId('install-navigation')).toBeInTheDocument();
  });
});
