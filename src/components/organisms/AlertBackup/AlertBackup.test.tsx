import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBackup } from './AlertBackup';

// Mock Core module
vi.mock('@/core', () => ({
  useOnboardingStore: vi.fn(() => ({
    secretKey: 'test-secret-key',
  })),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
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
  Dialog: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>),
  DialogTrigger: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  )),
  DialogClose: vi.fn(({ children }: { children: React.ReactNode }) => <div data-testid="dialog-close">{children}</div>),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-description" className={className}>
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
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
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
  TriangleAlert: ({ className }: { className?: string }) => (
    <div data-testid="triangle-alert" className={className}>
      TriangleAlert
    </div>
  ),
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
  ShieldCheck: ({ className }: { className?: string }) => (
    <div data-testid="shield-check" className={className}>
      ShieldCheck
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  DialogBackupPhrase: vi.fn(() => <div data-testid="dialog-backup-phrase">DialogBackupPhrase</div>),
  DialogExport: vi.fn(() => <div data-testid="dialog-export">DialogExport</div>),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogBackup: vi.fn(() => <div data-testid="dialog-backup">DialogBackup</div>),
  DialogConfirmBackup: vi.fn(() => <div data-testid="dialog-confirm-backup">DialogConfirmBackup</div>),
  DialogBackupEncrypted: vi.fn(() => <div data-testid="dialog-backup-encrypted">DialogBackupEncrypted</div>),
}));

describe('AlertBackup', () => {
  it('renders all required elements', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByText('Back up now')).toBeInTheDocument();
    expect(screen.getByText('to avoid losing your account!')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-backup')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-confirm-backup')).toBeInTheDocument();
  });
});

describe('AlertBackup - Snapshot', () => {
  it('matches snapshot for default AlertBackup', () => {
    const { container } = render(<AlertBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
