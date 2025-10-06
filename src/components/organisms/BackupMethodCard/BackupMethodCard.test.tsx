import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackupMethodCard } from './BackupMethodCard';

// Mock onboarding store
const mockUseOnboardingStore = vi.fn();
vi.mock('@/core', () => ({
  useOnboardingStore: () => mockUseOnboardingStore(),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level: number;
    size?: string;
    className?: string;
  }) => (
    <div data-testid={`heading-${level}`} data-size={size} className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="typography" data-size={size} className={className}>
      {children}
    </div>
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
  DialogHeader: vi.fn(() => <div data-testid="dialog-header" />),
  DialogTitle: vi.fn(() => <h2 data-testid="dialog-title" />),
  DialogDescription: vi.fn(() => <div data-testid="dialog-description" />),
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

// Mock molecules
vi.mock('@/molecules', () => ({
  ContentCard: ({
    children,
    image,
  }: {
    children: React.ReactNode;
    image?: { src: string; alt: string; width: number; height: number };
  }) => (
    <div data-testid="content-card" data-image-src={image?.src} data-image-alt={image?.alt}>
      {children}
    </div>
  ),
  PopoverBackup: () => <div data-testid="popover-backup">Backup Info</div>,
  DialogBackupPhrase: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-backup-phrase">{children || 'Backup Phrase'}</div>
  ),
  DialogExport: ({ mnemonic, children }: { mnemonic?: string; children?: React.ReactNode }) => (
    <div data-testid="dialog-export" data-mnemonic={mnemonic || ''}>
      {children || `Export ${mnemonic ? 'with mnemonic' : 'without mnemonic'}`}
    </div>
  ),
}));

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogBackupEncrypted: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dialog-backup-encrypted">{children || 'Backup Encrypted'}</div>
  ),
}));

describe('BackupMethodCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default mnemonic', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    expect(screen.getByTestId('content-card')).toBeInTheDocument();
    expect(screen.getByTestId('heading-2')).toHaveTextContent('Choose backup method');
  });

  it('renders with mnemonic from store', () => {
    const testMnemonic = 'wood fox silver drive march fee palace flame earn door case almost';
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: testMnemonic,
    });

    render(<BackupMethodCard />);

    const dialogExport = screen.getByTestId('dialog-export');
    expect(dialogExport).toHaveAttribute('data-mnemonic', testMnemonic);
    expect(dialogExport).toHaveTextContent('Export recovery phrase');
  });

  it('renders all backup options', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: 'test mnemonic',
    });

    render(<BackupMethodCard />);

    expect(screen.getByTestId('dialog-backup-phrase')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-backup-encrypted')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-export')).toBeInTheDocument();
  });

  it('renders content card with shield image', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    const contentCard = screen.getByTestId('content-card');
    expect(contentCard).toHaveAttribute('data-image-src', '/images/shield.png');
    expect(contentCard).toHaveAttribute('data-image-alt', 'Shield');
  });

  it('passes mnemonic correctly to DialogExport based on store state', () => {
    const testCases = [
      { mnemonic: '', expectedDisplay: 'Export to Pubky Ring' },
      { mnemonic: 'test phrase', expectedDisplay: 'Export recovery phrase' },
      {
        mnemonic: 'wood fox silver drive march fee palace flame earn door case almost',
        expectedDisplay: 'Export recovery phrase',
      },
    ];

    testCases.forEach(({ mnemonic, expectedDisplay }) => {
      mockUseOnboardingStore.mockReturnValue({ mnemonic });

      const { unmount } = render(<BackupMethodCard />);

      const dialogExport = screen.getByTestId('dialog-export');
      expect(dialogExport).toHaveAttribute('data-mnemonic', mnemonic);
      expect(dialogExport).toHaveTextContent(expectedDisplay);

      unmount();
    });
  });

  it('integrates correctly with onboarding store', () => {
    const testMnemonic = 'integration test mnemonic phrase';
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: testMnemonic,
      pubky: 'test-public-key',
      secretKey: 'test-secret-key',
      hasHydrated: true,
    });

    render(<BackupMethodCard />);

    // Should call the store hook
    expect(mockUseOnboardingStore).toHaveBeenCalled();

    // Should pass the mnemonic to DialogExport
    const dialogExport = screen.getByTestId('dialog-export');
    expect(dialogExport).toHaveAttribute('data-mnemonic', testMnemonic);
  });

  describe('organism behavior', () => {
    it('handles undefined mnemonic gracefully', () => {
      mockUseOnboardingStore.mockReturnValue({
        mnemonic: undefined,
      });

      render(<BackupMethodCard />);

      const dialogExport = screen.getByTestId('dialog-export');
      // When mnemonic is undefined, it should be treated as empty string
      expect(dialogExport).toHaveAttribute('data-mnemonic', '');
      expect(dialogExport).toHaveTextContent('Export to Pubky Ring');
    });

    it('maintains component structure regardless of store state', () => {
      const storeStates = [{ mnemonic: '' }, { mnemonic: 'test' }, { mnemonic: undefined }, { mnemonic: null }];

      storeStates.forEach((storeState) => {
        mockUseOnboardingStore.mockReturnValue(storeState);

        const { unmount } = render(<BackupMethodCard />);

        // All main components should always be present
        expect(screen.getByTestId('content-card')).toBeInTheDocument();
        expect(screen.getByTestId('heading-2')).toBeInTheDocument();
        expect(screen.getByTestId('popover-backup')).toBeInTheDocument();
        expect(screen.getByTestId('typography')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-backup-phrase')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-backup-encrypted')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-export')).toBeInTheDocument();

        unmount();
      });
    });
  });
});

describe('BackupMethodCard - Snapshots', () => {
  it('matches snapshot for default BackupMethodCard', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    const { container } = render(<BackupMethodCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
