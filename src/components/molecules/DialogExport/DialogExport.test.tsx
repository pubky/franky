/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogExport } from './DialogExport';

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

// Mock QRCodeSVG component
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
    <div data-testid="qr-code" data-value={value} data-size={size}>
      QR Code
    </div>
  ),
}));

// Mock icons from @/libs/icons
vi.mock('@/libs/icons', () => ({
  Scan: ({ className }: { className?: string }) => (
    <div data-testid="scan-icon" className={className}>
      Scan
    </div>
  ),
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
  Button: ({
    children,
    variant,
    size,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button
      data-testid={variant ? `button-${variant}` : 'button'}
      data-variant={variant}
      data-size={size}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Link: ({
    children,
    href,
    target,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    target?: string;
    className?: string;
  }) => (
    <a data-testid="link" href={href} target={target} className={className}>
      {children}
    </a>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('DialogExport', () => {
  it('renders with default props', () => {
    render(<DialogExport />);

    const dialog = screen.getByTestId('dialog');
    const trigger = screen.getByTestId('dialog-trigger');
    const content = screen.getByTestId('dialog-content');

    expect(dialog).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('renders trigger button with correct content', () => {
    render(<DialogExport />);

    const scanIcon = screen.getByTestId('scan-icon');
    const triggerText = screen.getByText('Export to Pubky Ring');

    expect(scanIcon).toBeInTheDocument();
    expect(triggerText).toBeInTheDocument();
    expect(scanIcon).toHaveClass('h-4', 'w-4');
  });

  it('applies correct styling to trigger button', () => {
    render(<DialogExport />);

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('gap-2');
  });

  it('applies asChild to dialog trigger', () => {
    render(<DialogExport />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('renders dialog title correctly', () => {
    render(<DialogExport />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Pubky Ring export');
    expect(title).toHaveClass('text-2xl', 'font-bold', 'leading-8');
  });

  it('renders dialog description with instructions', () => {
    render(<DialogExport />);

    const description = screen.getByTestId('dialog-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(/1. Open Pubky Ring, tap 'Add pubky'/);
    expect(description).toHaveTextContent(/2. Choose the 'Import pubky' option/);
    expect(description).toHaveTextContent(/3. Scan this QR to import/);
    expect(description).toHaveClass('text-sm', 'font-medium', 'leading-5');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogExport />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('p-8', 'rounded-xl', 'flex', 'flex-col', 'w-[430px]');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogExport />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('space-y-1.5', 'pr-6');
  });

  it('uses default dialog content without custom close button', () => {
    render(<DialogExport />);

    // The DialogExport component uses the default DialogContent, so we test that it renders properly
    const content = screen.getByTestId('dialog-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('p-8', 'rounded-xl', 'flex', 'flex-col', 'w-[430px]');

    // Check that the content does not have a custom close button
    const customCloseButton = screen.queryByTestId('button-ghost');
    expect(customCloseButton).not.toBeInTheDocument();
  });

  it('renders phone image correctly', () => {
    render(<DialogExport />);

    const images = screen.getAllByTestId('next-image');
    const phoneImage = images.find((img) => img.getAttribute('alt') === 'App preview');

    expect(phoneImage).toBeInTheDocument();
    expect(phoneImage).toHaveAttribute('src', '/images/pubky-ring-phone.png');
    expect(phoneImage).toHaveAttribute('width', '250');
    expect(phoneImage).toHaveAttribute('height', '430');
  });

  it('renders QR code with correct props', () => {
    render(<DialogExport />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('data-value', 'https://pubky.com');
    expect(qrCode).toHaveAttribute('data-size', '192');
  });

  it('applies correct styling to QR code container', () => {
    render(<DialogExport />);

    const containers = screen.getAllByTestId('container');
    const qrContainer = containers.find((container) => container.className?.includes('bg-foreground'));

    expect(qrContainer).toBeInTheDocument();
    expect(qrContainer).toHaveClass(
      'mx-0',
      'bg-foreground',
      'rounded-lg',
      'p-4',
      'w-[192px]',
      'h-[192px]',
      'items-center',
    );
  });

  it('renders Apple App Store badge', () => {
    render(<DialogExport />);

    const images = screen.getAllByTestId('next-image');
    const appleBadge = images.find((img) => img.getAttribute('alt') === 'App Store');

    expect(appleBadge).toBeInTheDocument();
    expect(appleBadge).toHaveAttribute('src', '/images/badge-apple.png');
    expect(appleBadge).toHaveAttribute('width', '120');
    expect(appleBadge).toHaveAttribute('height', '40');
  });

  it('renders Google Play Store badge', () => {
    render(<DialogExport />);

    const images = screen.getAllByTestId('next-image');
    const androidBadge = images.find((img) => img.getAttribute('alt') === 'Google Play');

    expect(androidBadge).toBeInTheDocument();
    expect(androidBadge).toHaveAttribute('src', '/images/badge-android.png');
    expect(androidBadge).toHaveAttribute('width', '135');
    expect(androidBadge).toHaveAttribute('height', '40');
  });

  it('renders app store links with correct URLs', () => {
    render(<DialogExport />);

    const links = screen.getAllByTestId('link');

    const appleLink = links.find((link) => link.getAttribute('href')?.includes('apps.apple.com'));
    const googleLink = links.find((link) => link.getAttribute('href')?.includes('play.google.com'));

    expect(appleLink).toBeInTheDocument();
    expect(appleLink).toHaveAttribute('href', 'https://apps.apple.com/app/pubky-ring/id6739356756');
    expect(appleLink).toHaveAttribute('target', '_blank');

    expect(googleLink).toBeInTheDocument();
    expect(googleLink).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=to.pubky.ring',
    );
    expect(googleLink).toHaveAttribute('target', '_blank');
  });

  it('applies correct layout styles', () => {
    render(<DialogExport />);

    const containers = screen.getAllByTestId('container');

    // Main container with items-center and justify-between
    const mainContainer = containers.find((container) =>
      container.className?.includes('justify-between items-center mt-6'),
    );

    // Flex-row container with gap
    const flexRowContainer = containers.find((container) => container.className?.includes('flex-row gap-6'));

    // Phone container
    const phoneContainer = containers.find((container) => container.className?.includes('w-[250px]'));

    expect(mainContainer).toBeInTheDocument();
    expect(flexRowContainer).toBeInTheDocument();
    expect(phoneContainer).toBeInTheDocument();
  });

  it('handles click events on trigger button', () => {
    render(<DialogExport />);

    const button = screen.getByTestId('button');

    // Simulate click event
    fireEvent.click(button);

    // The button should be rendered and clickable
    expect(button).toBeInTheDocument();
  });

  it('contains proper content structure', () => {
    render(<DialogExport />);

    // Check that all main elements are present
    expect(screen.getByText('Pubky Ring export')).toBeInTheDocument();
    expect(screen.getByText(/Open Pubky Ring, tap 'Add pubky'/)).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByAltText('App preview')).toBeInTheDocument();
    expect(screen.getByAltText('App Store')).toBeInTheDocument();
    expect(screen.getByAltText('Google Play')).toBeInTheDocument();
  });

  it('renders with semantic structure', () => {
    render(<DialogExport />);

    // Check semantic HTML structure
    const title = screen.getByTestId('dialog-title');
    const description = screen.getByTestId('dialog-description');

    expect(title.tagName).toBe('H2');
    expect(description.tagName).toBe('P');
  });
});
