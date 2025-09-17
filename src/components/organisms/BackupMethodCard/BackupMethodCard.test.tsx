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
  DialogBackupPhrase: () => <div data-testid="dialog-backup-phrase">Backup Phrase</div>,
  DialogBackupEncrypted: () => <div data-testid="dialog-backup-encrypted">Backup Encrypted</div>,
  DialogExport: ({ mnemonic }: { mnemonic?: string }) => (
    <div data-testid="dialog-export" data-mnemonic={mnemonic || ''}>
      Export {mnemonic ? 'with mnemonic' : 'without mnemonic'}
    </div>
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
    expect(screen.getByTestId('dialog-export')).toHaveAttribute('data-mnemonic', '');
  });

  it('renders with mnemonic from store', () => {
    const testMnemonic = 'wood fox silver drive march fee palace flame earn door case almost';
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: testMnemonic,
    });

    render(<BackupMethodCard />);

    const dialogExport = screen.getByTestId('dialog-export');
    expect(dialogExport).toHaveAttribute('data-mnemonic', testMnemonic);
    expect(dialogExport).toHaveTextContent('Export with mnemonic');
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

  it('renders backup description text', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    const typography = screen.getByTestId('typography');
    expect(typography).toHaveTextContent(/Safely back up and store the secret seed for your pubky/);
    expect(typography).toHaveAttribute('data-size', 'sm');
  });

  it('renders popover backup component', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    expect(screen.getByTestId('popover-backup')).toBeInTheDocument();
  });

  it('applies correct layout styles', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    const containers = screen.getAllByTestId('container');

    // Header container with flex-row and items-center
    const headerContainer = containers.find((container) =>
      container.className?.includes('items-center gap-1 flex-row'),
    );

    // Description container with max-width
    const descriptionContainer = containers.find((container) => container.className?.includes('max-w-[576px] mx-0'));

    // Buttons container with flex-row and gap
    const buttonsContainer = containers.find((container) =>
      container.className?.includes('flex-row mt-6 gap-3 flex-wrap'),
    );

    expect(headerContainer).toBeInTheDocument();
    expect(descriptionContainer).toBeInTheDocument();
    expect(buttonsContainer).toBeInTheDocument();
  });

  it('renders heading with correct size and level', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    const heading = screen.getByTestId('heading-2');
    expect(heading).toHaveAttribute('data-size', 'lg');
    expect(heading).toHaveTextContent('Choose backup method');
  });

  it('renders typography with correct styling classes', () => {
    mockUseOnboardingStore.mockReturnValue({
      mnemonic: '',
    });

    render(<BackupMethodCard />);

    const typography = screen.getByTestId('typography');
    expect(typography.className).toContain('text-secondary-foreground');
    expect(typography.className).toContain('opacity-80');
    expect(typography.className).toContain('font-medium');
    expect(typography.className).toContain('text-base');
  });

  it('passes mnemonic correctly to DialogExport based on store state', () => {
    const testCases = [
      { mnemonic: '', expectedDisplay: 'Export without mnemonic' },
      { mnemonic: 'test phrase', expectedDisplay: 'Export with mnemonic' },
      {
        mnemonic: 'wood fox silver drive march fee palace flame earn door case almost',
        expectedDisplay: 'Export with mnemonic',
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
      publicKey: 'test-public-key',
      secretKey: 'test-secret-key',
      isBackedUp: false,
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
      expect(dialogExport).toHaveTextContent('Export without mnemonic');
    });

    it('handles null mnemonic gracefully', () => {
      mockUseOnboardingStore.mockReturnValue({
        mnemonic: null,
      });

      render(<BackupMethodCard />);

      const dialogExport = screen.getByTestId('dialog-export');
      // When mnemonic is null, it should be treated as empty string
      expect(dialogExport).toHaveAttribute('data-mnemonic', '');
      expect(dialogExport).toHaveTextContent('Export without mnemonic');
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
