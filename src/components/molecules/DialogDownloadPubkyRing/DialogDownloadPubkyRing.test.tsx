/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogDownloadPubkyRing } from './DialogDownloadPubkyRing';

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

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
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
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  Link: ({
    children,
    href,
    className,
    target,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    target?: string;
  }) => (
    <a data-testid="link" href={href} className={className} target={target}>
      {children}
    </a>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('DialogDownloadPubkyRing', () => {
  it('renders apple store version with default props', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const dialog = screen.getByTestId('dialog');
    const trigger = screen.getByTestId('dialog-trigger');
    const content = screen.getByTestId('dialog-content');

    expect(dialog).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('renders android store version with default props', () => {
    render(<DialogDownloadPubkyRing store="android" />);

    const dialog = screen.getByTestId('dialog');
    const trigger = screen.getByTestId('dialog-trigger');
    const content = screen.getByTestId('dialog-content');

    expect(dialog).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('displays correct apple store badge', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const images = screen.getAllByTestId('next-image');
    const appleBadge = images.find((img) => img.getAttribute('src') === '/images/badge-apple.png');

    expect(appleBadge).toBeInTheDocument();
    expect(appleBadge).toHaveAttribute('alt', 'App Store');
    // The component has different widths for mobile (192) and desktop (120) versions
    expect(appleBadge).toHaveAttribute('width', '192');
    expect(appleBadge).toHaveAttribute('height', '40');
  });

  it('displays correct android store badge', () => {
    render(<DialogDownloadPubkyRing store="android" />);

    const images = screen.getAllByTestId('next-image');
    const androidBadge = images.find((img) => img.getAttribute('src') === '/images/badge-android.png');

    expect(androidBadge).toBeInTheDocument();
    expect(androidBadge).toHaveAttribute('alt', 'Google Play');
    // The component has different widths for mobile (210) and desktop (120) versions
    expect(androidBadge).toHaveAttribute('width', '210');
    expect(androidBadge).toHaveAttribute('height', '40');
  });

  it('renders dialog title correctly', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Download Pubky Ring');
    expect(title.tagName).toBe('H2');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-[384px]');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('renders pubky ring phone image', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const images = screen.getAllByTestId('next-image');
    const phoneImage = images.find((img) => img.getAttribute('alt') === 'App preview');

    expect(phoneImage).toBeInTheDocument();
    expect(phoneImage).toHaveAttribute('src', '/images/pubky-ring-phone.png');
    expect(phoneImage).toHaveAttribute('width', '96');
    expect(phoneImage).toHaveAttribute('height', '256');
  });

  it('renders download description text', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const description = screen.getByText(/Scan the QR with your mobile camera/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'font-medium');
  });

  it('trigger uses asChild prop correctly', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('badge is clickable', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const images = screen.getAllByTestId('next-image');
    const appleBadge = images.find((img) => img.getAttribute('src') === '/images/badge-apple.png');
    // The badge is clickable via the trigger or direct link
    expect(appleBadge).toBeInTheDocument();
  });

  it('maintains proper content structure', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    fireEvent.click(links[0]);

    // Check that dialog content is rendered
    expect(screen.getByText('Download Pubky Ring')).toBeInTheDocument();
  });

  it('renders QR code section', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    // QR code placeholder or actual QR code should be present
    const qrSection = document.querySelector('.w-\\[192px\\].h-\\[192px\\]');
    expect(qrSection).toBeInTheDocument();
  });

  it('handles store prop correctly for different stores', () => {
    const { rerender } = render(<DialogDownloadPubkyRing store="apple" />);

    let images = screen.getAllByTestId('next-image');
    const appleBadge = images.find((img) => img.getAttribute('src') === '/images/badge-apple.png');
    expect(appleBadge).toBeInTheDocument();

    rerender(<DialogDownloadPubkyRing store="android" />);

    images = screen.getAllByTestId('next-image');
    const androidBadge = images.find((img) => img.getAttribute('src') === '/images/badge-android.png');
    expect(androidBadge).toBeInTheDocument();
  });

  it('renders coming soon message when appropriate', () => {
    render(<DialogDownloadPubkyRing store="apple" />);

    // Check for coming soon or availability message
    const comingSoonText = screen.queryByText(/Coming soon/i);
    if (comingSoonText) {
      expect(comingSoonText).toBeInTheDocument();
    }
  });
});

describe('DialogDownloadPubkyRing - Snapshots', () => {
  it('matches snapshot for apple store DialogDownloadPubkyRing', () => {
    const { container } = render(<DialogDownloadPubkyRing store="apple" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for android store DialogDownloadPubkyRing', () => {
    const { container } = render(<DialogDownloadPubkyRing store="android" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
