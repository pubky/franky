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

// Mock @/libs to intercept Libs.Scan
vi.mock('@/libs', () => ({
  Scan: ({ className }: { className?: string }) => (
    <div data-testid="scan-icon" className={className}>
      Scan
    </div>
  ),
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
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

  it('handles click events on trigger button', () => {
    render(<DialogExport />);

    const button = screen.getByTestId('button');

    fireEvent.click(button);

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

  describe('with mnemonic prop', () => {
    it('renders with mnemonic-specific title and button text', () => {
      const testMnemonic = 'wood fox silver drive march fee palace flame earn door case almost';
      render(<DialogExport mnemonic={testMnemonic} />);

      const title = screen.getByTestId('dialog-title');
      const triggerText = screen.getByText('Export recovery phrase');

      expect(title).toHaveTextContent('Import recovery phrase');
      expect(triggerText).toBeInTheDocument();
    });
  });
});

describe('DialogExport - Snapshots', () => {
  it('matches snapshot for default DialogExport', () => {
    const { container } = render(<DialogExport />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogExport with mnemonic', () => {
    const testMnemonic = 'wood fox silver drive march fee palace flame earn door case almost';
    const { container } = render(<DialogExport mnemonic={testMnemonic} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogExport with special mnemonic', () => {
    const specialMnemonic = 'test phrase with spaces & symbols!';
    const { container } = render(<DialogExport mnemonic={specialMnemonic} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
