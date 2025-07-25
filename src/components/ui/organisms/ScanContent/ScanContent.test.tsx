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
    onClick,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="authorize-button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
  ButtonsNavigation: ({
    onHandleBackButton,
    backText,
    continueText,
    backButtonDisabled,
    continueButtonDisabled,
  }: {
    onHandleBackButton?: () => void;
    backText?: string;
    continueText?: string;
    backButtonDisabled?: boolean;
    continueButtonDisabled?: boolean;
  }) => (
    <div data-testid="buttons-navigation">
      <button onClick={onHandleBackButton} data-testid="back-btn" disabled={backButtonDisabled}>
        {backText}
      </button>
      <button data-testid="continue-btn" disabled={continueButtonDisabled}>
        {continueText}
      </button>
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
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

    const images = screen.getAllByAltText('Pubky Ring');
    const logoImage = images.find((img) => img.getAttribute('src') === '/images/logo-pubky-ring.svg');
    const authorizeButton = screen.getByTestId('authorize-button');
    const keyIcon = screen.getByTestId('key-icon');

    expect(logoImage).toBeInTheDocument();
    expect(authorizeButton).toBeInTheDocument();
    expect(authorizeButton).toHaveTextContent('Authorize with Pubky Ring');
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

  it('renders ButtonsNavigation with correct props', () => {
    render(<ScanContent />);

    const buttonsNavigation = screen.getByTestId('buttons-navigation');
    const backButton = screen.getByTestId('back-btn');
    const continueButton = screen.getByTestId('continue-btn');

    expect(buttonsNavigation).toBeInTheDocument();
    expect(backButton).toHaveTextContent('Back');
    expect(backButton).not.toBeDisabled();
    expect(continueButton).toHaveTextContent('Continue');
    expect(continueButton).toBeDisabled();
  });

  it('handles back button click through ButtonsNavigation', () => {
    const handleBackButton = vi.fn();
    render(<ScanContent onHandleBackButton={handleBackButton} />);

    const backButton = screen.getByTestId('back-btn');
    fireEvent.click(backButton);

    expect(handleBackButton).toHaveBeenCalledTimes(1);
  });

  it('renders cards with proper styling', () => {
    render(<ScanContent />);

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2); // One for desktop, one for mobile

    cards.forEach((card) => {
      expect(card).toHaveClass('p-6', 'lg:p-12');
    });
  });

  it('maintains proper responsive structure', () => {
    render(<ScanContent />);

    // Desktop section should be hidden on mobile
    const desktopSection = screen.getByText(/Scan/).closest('.hidden.md\\:flex');
    expect(desktopSection).toBeInTheDocument();

    // Mobile section should be hidden on desktop
    const mobileSection = screen.getByText(/Tap to/).closest('.flex.md\\:hidden');
    expect(mobileSection).toBeInTheDocument();
  });

  it('renders authorize button with proper styling and content', () => {
    render(<ScanContent />);

    const authorizeButton = screen.getByTestId('authorize-button');
    expect(authorizeButton).toHaveClass('w-full', 'h-[60px]', 'rounded-full');
    expect(authorizeButton).toHaveTextContent('Authorize with Pubky Ring');
  });

  it('displays proper footer text about keychain compatibility', () => {
    render(<ScanContent />);

    const footerText = screen.getByText(/Use.*or any other.*–powered keychain\./);
    expect(footerText).toBeInTheDocument();
    expect(footerText).toHaveClass('text-sm', 'text-muted-foreground', 'opacity-80');
  });
});
