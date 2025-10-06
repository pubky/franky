import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogBackup } from './DialogBackup';

// Mock Core module
vi.mock('@/core', () => ({
  useOnboardingStore: vi.fn(() => ({
    mnemonic: 'test mnemonic phrase',
  })),
}));

// Mock Molecules
vi.mock('@/molecules', () => ({
  DialogBackupPhrase: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-backup-phrase">{children || 'DialogBackupPhrase'}</div>
  ),
  DialogExport: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-export">{children || 'DialogExport'}</div>
  ),
}));

// Mock Organisms
vi.mock('@/organisms', () => ({
  DialogBackupEncrypted: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-backup-encrypted">{children || 'DialogBackupEncrypted'}</div>
  ),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>),
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
    <div data-testid="dialog-description" className={className}>
      {children}
    </div>
  ),
  DialogTrigger: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  )),
  DialogClose: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="dialog-close">{children}</div>),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid="button" data-variant={variant} className={className} onClick={onClick}>
      {children}
    </button>
  ),
  Label: ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label data-testid="label" htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ),
  Input: ({
    type,
    id,
    placeholder,
    value,
    onChange,
    className,
  }: {
    type?: string;
    id?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input
      data-testid="input"
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left" className={className}>
      ArrowLeft
    </div>
  ),
  Download: ({ className }: { className?: string }) => (
    <div data-testid="download" className={className}>
      Download
    </div>
  ),
  Eye: ({ className }: { className?: string }) => (
    <div data-testid="eye" className={className}>
      Eye
    </div>
  ),
  EyeOff: ({ className }: { className?: string }) => (
    <div data-testid="eye-off" className={className}>
      EyeOff
    </div>
  ),
  Copy: ({ className }: { className?: string }) => (
    <div data-testid="copy" className={className}>
      Copy
    </div>
  ),
  Check: ({ className }: { className?: string }) => (
    <div data-testid="check" className={className}>
      Check
    </div>
  ),
  TriangleAlert: ({ className }: { className?: string }) => (
    <div data-testid="triangle-alert" className={className}>
      TriangleAlert
    </div>
  ),
  ShieldCheck: ({ className }: { className?: string }) => (
    <div data-testid="shield-check" className={className}>
      ShieldCheck
    </div>
  ),
  FileText: ({ className }: { className?: string }) => (
    <div data-testid="file-text" className={className}>
      FileText
    </div>
  ),
  Scan: ({ className }: { className?: string }) => (
    <div data-testid="scan" className={className}>
      Scan
    </div>
  ),
}));

// Mock Next.js Image
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
  }) => (
    <div
      data-testid="image"
      data-src={src}
      data-alt={alt}
      data-width={width}
      data-height={height}
      className={className}
    >
      Next.js Image: {alt}
    </div>
  ),
}));

describe('DialogBackup', () => {
  it('renders all required elements', () => {
    render(<DialogBackup />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getAllByTestId('card')).toHaveLength(3);
    expect(screen.getAllByTestId('image')).toHaveLength(3);
    expect(screen.getByTestId('dialog-backup-phrase')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-backup-encrypted')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-export')).toBeInTheDocument();
  });
});

describe('DialogBackup - Snapshots', () => {
  it('matches snapshot for trigger button', () => {
    const { container } = render(<DialogBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
