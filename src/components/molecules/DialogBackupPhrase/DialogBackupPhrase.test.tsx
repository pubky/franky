import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DialogBackupPhrase } from './DialogBackupPhrase';

// Mock Next.js Image
vi.mock('next/image', () => ({
  __esModule: true,
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
  }) => <img data-testid="next-image" src={src} alt={alt} width={width} height={height} className={className} />,
}));

// Mock stores
vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    secretKey: 'mock-secret-key',
  }),
}));

// Mock identity library
vi.mock('@/libs', () => ({
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
  FileText: ({ className }: { className?: string }) => (
    <div data-testid="file-text-icon" className={className}>
      FileText
    </div>
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left-icon" className={className}>
      ArrowLeft
    </div>
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <div data-testid="arrow-right-icon" className={className}>
      ArrowRight
    </div>
  ),
  Eye: ({ className }: { className?: string }) => (
    <div data-testid="eye-icon" className={className}>
      Eye
    </div>
  ),
  EyeOff: ({ className }: { className?: string }) => (
    <div data-testid="eye-off-icon" className={className}>
      EyeOff
    </div>
  ),
  Copy: ({ className }: { className?: string }) => (
    <div data-testid="copy-icon" className={className}>
      Copy
    </div>
  ),
  Identity: {
    generateSeedWords: vi.fn(() => [
      'word1',
      'word2',
      'word3',
      'word4',
      'word5',
      'word6',
      'word7',
      'word8',
      'word9',
      'word10',
      'word11',
      'word12',
    ]),
  },
  copyToClipboard: vi.fn(),
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
  DialogClose: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-close" data-as-child={asChild}>
      {children}
    </div>
  ),
  Button: ({
    children,
    variant,
    className,
    onClick,
    disabled,
    size,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    size?: string;
  }) => (
    <button
      data-testid={`button-${variant || 'default'}`}
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-size={size}
    >
      {children}
    </button>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

describe('DialogBackupPhrase - Snapshots', () => {
  it('matches snapshot for default DialogBackupPhrase', () => {
    const { container } = render(<DialogBackupPhrase />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
