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
    <div data-testid="card" className={className}>
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
}));

describe('InstallContent', () => {
  it('renders with default props', () => {
    render(<InstallContent />);

    const title = screen.getByText(/Install/);
    const subtitle = screen.getByText(/Pubky Ring is a keychain/);
    const card = screen.getByTestId('card');
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

    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Install Pubky Ring.');
  });

  it('displays correct subtitle', () => {
    render(<InstallContent />);

    const subtitle = screen.getByRole('heading', { level: 2 });
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveTextContent('Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.');
  });

  it('renders keyring image with correct attributes', () => {
    render(<InstallContent />);

    const images = screen.getAllByTestId('next-image');
    const keyringImage = images.find((img) => img.getAttribute('alt') === 'Keyring');

    expect(keyringImage).toBeInTheDocument();
    expect(keyringImage).toHaveAttribute('src', '/images/keyring.png');
    expect(keyringImage).toHaveAttribute('width', '192');
    expect(keyringImage).toHaveAttribute('height', '192');
  });

  it('renders pubky ring logo with correct attributes', () => {
    render(<InstallContent />);

    const images = screen.getAllByTestId('next-image');
    const logoImage = images.find((img) => img.getAttribute('alt') === 'Pubky Ring');

    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/images/logo-pubky-ring.svg');
    expect(logoImage).toHaveAttribute('width', '220');
    expect(logoImage).toHaveAttribute('height', '48');
  });

  it('displays correct description text', () => {
    render(<InstallContent />);

    const description = screen.getByText('Download and install the mobile app to start creating your account.');
    expect(description).toBeInTheDocument();
  });

  it('renders footer text with correct links', () => {
    render(<InstallContent />);

    const pubkyRingLink = screen.getByRole('link', { name: 'Pubky Ring' });
    const pubkyCoreLink = screen.getByRole('link', { name: 'Pubky Core' });

    expect(pubkyRingLink).toBeInTheDocument();
    expect(pubkyRingLink).toHaveAttribute('href', 'https://www.pubkyring.to/');
    expect(pubkyRingLink).toHaveAttribute('target', '_blank');

    expect(pubkyCoreLink).toBeInTheDocument();
    expect(pubkyCoreLink).toHaveAttribute('href', 'https://pubky.org');
    expect(pubkyCoreLink).toHaveAttribute('target', '_blank');
  });

  it('calls onCreateKeysInBrowser when create keys button is clicked', () => {
    const mockHandler = vi.fn();
    render(<InstallContent onCreateKeysInBrowser={mockHandler} />);

    const createKeysButton = screen.getByTestId('create-keys-btn');
    fireEvent.click(createKeysButton);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('calls onContinueWithPubkyRing when continue button is clicked', () => {
    const mockHandler = vi.fn();
    render(<InstallContent onContinueWithPubkyRing={mockHandler} />);

    const continueButton = screen.getByTestId('continue-btn');
    fireEvent.click(continueButton);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('applies default className', () => {
    const { container } = render(<InstallContent />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('container', 'mx-auto', 'px-6', 'lg:px-10', 'lg:pt-8');
  });

  it('applies custom className', () => {
    const { container } = render(<InstallContent className="custom-class" />);

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('custom-class');
  });

  it('maintains proper structure', () => {
    render(<InstallContent />);

    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();

    const contentContainer = main?.querySelector('.max-w-\\[1200px\\]');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('flex', 'flex-col', 'gap-6', 'max-w-[1200px]', 'mx-auto');
  });

  it('renders card with correct styling', () => {
    render(<InstallContent />);

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('p-6', 'lg:p-12');
  });

  it('keyring image is hidden on mobile', () => {
    render(<InstallContent />);

    const images = screen.getAllByTestId('next-image');
    const keyringImage = images.find((img) => img.getAttribute('alt') === 'Keyring');
    const imageContainer = keyringImage?.closest('div');

    expect(imageContainer).toHaveClass('hidden', 'lg:flex');
  });

  it('handles undefined event handlers gracefully', () => {
    render(<InstallContent />);

    const createKeysButton = screen.getByTestId('create-keys-btn');
    const continueButton = screen.getByTestId('continue-btn');

    // These should not throw errors
    expect(() => fireEvent.click(createKeysButton)).not.toThrow();
    expect(() => fireEvent.click(continueButton)).not.toThrow();
  });

  it('renders all required sections', () => {
    render(<InstallContent />);

    // Header section
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    // Card section
    expect(screen.getByTestId('card')).toBeInTheDocument();

    // Store buttons section
    expect(screen.getByTestId('store-buttons')).toBeInTheDocument();

    // Footer text
    expect(screen.getByText(/Use/)).toBeInTheDocument();
    expect(screen.getAllByText(/Pubky Ring/).length).toBeGreaterThan(0);
    expect(screen.getByText(/or any other/)).toBeInTheDocument();

    // Navigation section
    expect(screen.getByTestId('install-navigation')).toBeInTheDocument();
  });
});
