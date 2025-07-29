import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanContent } from './ScanContent';

// Mock Next.js Image component
/* eslint-disable @next/next/no-img-element */
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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Key: ({ className }: { className?: string }) => (
    <div data-testid="key-icon" className={className}>
      Key
    </div>
  ),
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({
    children,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => (
    <button className={className} {...rest}>
      {children}
    </button>
  ),
  ButtonsNavigation: ({ onHandleBackButton }: { onHandleBackButton?: () => void }) => (
    <div data-testid="buttons-navigation">
      <button onClick={onHandleBackButton} data-testid="back-button">
        Back
      </button>
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-slot="card" data-testid="card" className={className}>
      {children}
    </div>
  ),
  PageHeader: ({
    title,
    subtitle,
    className,
    titleSize,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    className?: string;
    titleSize?: string;
  }) => (
    <div data-testid="page-header" className={className}>
      <h1 data-title-size={titleSize}>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </div>
  ),
  ContentCard: ({
    children,
    className,
    layout,
  }: {
    children: React.ReactNode;
    className?: string;
    layout?: string;
  }) => (
    <div data-testid="content-card" data-slot="card" data-layout={layout} className={className}>
      {children}
    </div>
  ),
  FooterLinks: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="footer-links" className={className}>
      {children}
    </p>
  ),
  BrandText: ({ children, className, inline }: { children: React.ReactNode; className?: string; inline?: boolean }) => (
    <span data-testid="brand-text" data-inline={inline} className={className}>
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
  ResponsiveSection: ({
    desktop,
    mobile,
    className,
  }: {
    desktop?: React.ReactNode;
    mobile?: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="responsive-section" className={className}>
      {desktop && <div data-testid="desktop-section">{desktop}</div>}
      {mobile && <div data-testid="mobile-section">{mobile}</div>}
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

describe('ScanContent', () => {
  it('renders with default props', () => {
    render(<ScanContent />);

    // Check main headings
    expect(screen.getByText(/Scan/)).toBeInTheDocument();
    expect(screen.getByText(/QR Code./)).toBeInTheDocument();
    expect(screen.getByText(/Tap to/)).toBeInTheDocument();
    expect(screen.getAllByText(/Authorize./).length).toBeGreaterThanOrEqual(1);

    // Check description text
    expect(screen.getAllByText(/Open Pubky Ring, create a pubky, and scan the QR./)).toHaveLength(2);
  });

  it('applies custom className', () => {
    render(<ScanContent className="custom-scan-class" />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('custom-scan-class');
  });

  it('renders desktop version with QR image', () => {
    render(<ScanContent />);

    const images = screen.getAllByAltText('Pubky Ring');
    const qrImage = images.find((img) => img.getAttribute('src') === '/images/pubky-ring-qr-example.png');
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveAttribute('src', '/images/pubky-ring-qr-example.png');
    expect(qrImage).toHaveAttribute('width', '220');
    expect(qrImage).toHaveAttribute('height', '220');
  });

  it('renders mobile version with logo and authorize button', () => {
    render(<ScanContent />);

    // Check for both images with alt text "Pubky Ring"
    const images = screen.getAllByAltText('Pubky Ring');
    const logoImage = images.find((img) => img.getAttribute('src') === '/images/logo-pubky-ring.svg');
    const authorizeButton = screen.getByText('Authorize with Pubky Ring').closest('button');
    const keyIcon = screen.getByTestId('key-icon');

    expect(logoImage).toBeInTheDocument();
    expect(authorizeButton).toBeInTheDocument();
    expect(keyIcon).toBeInTheDocument();
  });

  it('renders footer with proper links', () => {
    render(<ScanContent />);

    const pubkyRingLink = screen.getByRole('link', { name: /Pubky Ring/i });
    const pubkyCoreLink = screen.getByRole('link', { name: /Pubky Core/i });

    expect(pubkyRingLink).toBeInTheDocument();
    expect(pubkyRingLink).toHaveAttribute('href', 'https://www.pubkyring.to/');
    expect(pubkyRingLink).toHaveAttribute('target', '_blank');

    expect(pubkyCoreLink).toBeInTheDocument();
    expect(pubkyCoreLink).toHaveAttribute('href', 'https://pubky.org');
    expect(pubkyCoreLink).toHaveAttribute('target', '_blank');
  });

  it('renders authorize button with proper styling and content', () => {
    render(<ScanContent />);

    // The button is no longer directly wrapped with data-testid, so we find it by content
    const authorizeButton = screen.getByText('Authorize with Pubky Ring').closest('button');
    expect(authorizeButton).toHaveClass('w-full', 'h-[60px]', 'rounded-full');
    expect(authorizeButton).toHaveTextContent('Authorize with Pubky Ring');
  });

  it('renders ButtonsNavigation with correct props', () => {
    render(<ScanContent onHandleBackButton={vi.fn()} />);

    const buttonsNavigation = screen.getByTestId('buttons-navigation');
    const backButton = screen.getByTestId('back-button'); // Updated to match mock
    // No continue button should be rendered since hiddenContinueButton is true
    const continueButton = screen.queryByTestId('continue-btn');

    expect(buttonsNavigation).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
    expect(continueButton).not.toBeInTheDocument();
  });

  it('handles back button click through ButtonsNavigation', () => {
    const handleBackButton = vi.fn();
    render(<ScanContent onHandleBackButton={handleBackButton} />);

    const backButton = screen.getByTestId('back-button'); // Updated to match mock
    fireEvent.click(backButton);

    expect(handleBackButton).toHaveBeenCalledTimes(1);
  });

  it('renders cards with proper styling', () => {
    render(<ScanContent />);

    // Update to use content-card since we're now using ContentCard component
    const cards = screen.getAllByTestId('content-card');
    expect(cards).toHaveLength(2); // One for desktop, one for mobile

    cards.forEach((card) => {
      expect(card).toHaveAttribute('data-layout', 'column');
      expect(card).toHaveAttribute('data-slot', 'card');
    });
  });

  it('maintains proper responsive structure', () => {
    render(<ScanContent />);

    // Update to match ResponsiveSection structure
    const responsiveSection = screen.getByTestId('responsive-section');
    expect(responsiveSection).toBeInTheDocument();

    const desktopSection = screen.getByTestId('desktop-section');
    const mobileSection = screen.getByTestId('mobile-section');

    expect(desktopSection).toBeInTheDocument();
    expect(mobileSection).toBeInTheDocument();
  });

  it('displays proper footer text about keychain compatibility', () => {
    render(<ScanContent />);

    const footerText = screen.getByText(/Use.*or any other.*–powered keychain\./);
    expect(footerText).toBeInTheDocument();
    expect(footerText).toHaveAttribute('data-testid', 'footer-links');
  });
});
