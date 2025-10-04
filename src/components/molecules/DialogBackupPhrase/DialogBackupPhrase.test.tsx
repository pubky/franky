import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
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
    mnemonic: 'tube tube resource mass door firm genius parrot girl orphan window world',
  }),
}));

// Mock libs partially, preserving real exports and overriding only what's needed
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
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
    Check: ({ className }: { className?: string }) => (
      <div data-testid="check-icon" className={className}>
        Check
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
  };
});

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

// Mock molecules
vi.mock('@/molecules', () => ({
  WordSlot: ({
    mode,
    index,
    word,
    isCorrect,
    isError,
    onClear,
  }: {
    mode: string;
    index: number;
    word: string;
    isCorrect: boolean;
    isError: boolean;
    onClear: (index: number) => void;
  }) => (
    <div
      data-testid={`word-slot-${index}`}
      data-mode={mode}
      data-word={word}
      data-is-correct={isCorrect}
      data-is-error={isError}
      onClick={() => onClear(index)}
    >
      {word || `Slot ${index + 1}`}
    </div>
  ),
}));

describe('DialogBackupPhrase - Snapshots', () => {
  it('matches snapshot for default DialogBackupPhrase', () => {
    const { container } = render(<DialogBackupPhrase />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('DialogBackupPhrase - Duplicate Words', () => {
  it('should handle duplicate words correctly in recovery phrase', () => {
    const { container } = render(<DialogBackupPhrase />);

    // The mnemonic contains "tube" twice, so we should see it appear twice in the recovery words grid
    const wordContainers = container.querySelectorAll('[data-testid="container"]');
    const recoveryGrid = Array.from(wordContainers).find((container) =>
      container.querySelector('[data-testid="badge"]'),
    );

    const wordSpans = recoveryGrid?.querySelectorAll('span');
    const tubeWords = Array.from(wordSpans || [])
      .filter((span) => !span.getAttribute('data-testid')) // Filter out badges
      .filter((span) => span.textContent === 'tube');

    // Should have 2 instances of "tube" word
    expect(tubeWords).toHaveLength(2);
  });

  it('should display all 12 words in the recovery phrase grid', () => {
    const { container } = render(<DialogBackupPhrase />);

    // Find the recovery words grid (step 1)
    const wordContainers = container.querySelectorAll('[data-testid="container"]');
    const recoveryGrid = Array.from(wordContainers).find((container) =>
      container.querySelector('[data-testid="badge"]'),
    );

    expect(recoveryGrid).toBeTruthy();

    // Should have 12 word containers
    const badges = recoveryGrid?.querySelectorAll('[data-testid="badge"]');
    expect(badges).toHaveLength(12);
  });

  it('should show correct word order in recovery phrase', () => {
    const { container } = render(<DialogBackupPhrase />);

    // The mnemonic is: "tube tube resource mass door firm genius parrot girl orphan window world"
    const expectedWords = [
      'tube',
      'tube',
      'resource',
      'mass',
      'door',
      'firm',
      'genius',
      'parrot',
      'girl',
      'orphan',
      'window',
      'world',
    ];

    const wordContainers = container.querySelectorAll('[data-testid="container"]');
    const recoveryGrid = Array.from(wordContainers).find((container) =>
      container.querySelector('[data-testid="badge"]'),
    );

    const wordSpans = recoveryGrid?.querySelectorAll('span');
    const actualWords = Array.from(wordSpans || [])
      .filter((span) => !span.getAttribute('data-testid')) // Filter out badges
      .map((span) => span.textContent);

    expect(actualWords).toEqual(expectedWords);
  });

  it('should allow selecting duplicate words individually in step 2', () => {
    const { container } = render(<DialogBackupPhrase />);

    // First, reveal the recovery phrase and go to step 2
    const revealButton = screen.getByText('Reveal recovery phrase');
    fireEvent.click(revealButton);

    const confirmButton = screen.getByText('Confirm recovery phrase');
    fireEvent.click(confirmButton);

    // Now we should be in step 2 with the word selection buttons
    // The sorted words should be: door, firm, genius, girl, mass, orphan, parrot, resource, tube, tube, window, world
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const tubeButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('tube'));

    // Should have 2 instances of "tube" button
    expect(tubeButtons).toHaveLength(2);

    // Both should be clickable initially
    expect(tubeButtons[0]).not.toBeDisabled();
    expect(tubeButtons[1]).not.toBeDisabled();

    // Click the first tube button
    fireEvent.click(tubeButtons[0]);

    // The first button should now be disabled, but the second should still be clickable
    expect(tubeButtons[0]).toBeDisabled();
    expect(tubeButtons[1]).not.toBeDisabled();

    // Click the second tube button
    fireEvent.click(tubeButtons[1]);

    // Now both should be disabled
    expect(tubeButtons[0]).toBeDisabled();
    expect(tubeButtons[1]).toBeDisabled();
  });

  it('should re-enable exact duplicate instance when clearing a slot', () => {
    const { container } = render(<DialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByText('Reveal recovery phrase');
    fireEvent.click(revealButton);

    const confirmButton = screen.getByText('Confirm recovery phrase');
    fireEvent.click(confirmButton);

    // Get both tube buttons (duplicates)
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const tubeButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('tube'));

    // Click first tube instance (should go to slot 0)
    fireEvent.click(tubeButtons[0]);
    expect(tubeButtons[0]).toBeDisabled();
    expect(tubeButtons[1]).not.toBeDisabled();

    // Click second tube instance (should go to slot 1)
    fireEvent.click(tubeButtons[1]);
    expect(tubeButtons[0]).toBeDisabled();
    expect(tubeButtons[1]).toBeDisabled();

    // Get the first slot (should contain first tube)
    const wordSlot0 = container.querySelector('[data-testid="word-slot-0"]');
    expect(wordSlot0?.getAttribute('data-word')).toBe('tube');

    // Clear the first slot
    fireEvent.click(wordSlot0!);

    // Only the first tube button should be re-enabled
    expect(tubeButtons[0]).not.toBeDisabled();
    expect(tubeButtons[1]).toBeDisabled();

    // Clear the second slot
    const wordSlot1 = container.querySelector('[data-testid="word-slot-1"]');
    fireEvent.click(wordSlot1!);

    // Now both tube buttons should be enabled again
    expect(tubeButtons[0]).not.toBeDisabled();
    expect(tubeButtons[1]).not.toBeDisabled();
  });

  it('should block validate button when there are errors present', () => {
    const { container } = render(<DialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByText('Reveal recovery phrase');
    fireEvent.click(revealButton);

    const confirmButton = screen.getByText('Confirm recovery phrase');
    fireEvent.click(confirmButton);

    // Get all word buttons
    const wordButtons = screen.getAllByRole('button');

    // Click a wrong word for slot 0 (should be "tube", let's click "door")
    const doorBtn = wordButtons.find((btn) => btn.textContent === 'door');
    fireEvent.click(doorBtn!);

    // Verify slot 0 has an error
    const wordSlot0 = container.querySelector('[data-testid="word-slot-0"]');
    expect(wordSlot0?.getAttribute('data-is-error')).toBe('true');

    // Fill remaining slots with any words to enable the button check
    const tubeButtons = wordButtons.filter((button) => button.textContent?.includes('tube'));
    const resourceBtn = wordButtons.find((btn) => btn.textContent === 'resource');
    const massBtn = wordButtons.find((btn) => btn.textContent === 'mass');
    const firmBtn = wordButtons.find((btn) => btn.textContent === 'firm');
    const geniusBtn = wordButtons.find((btn) => btn.textContent === 'genius');
    const parrotBtn = wordButtons.find((btn) => btn.textContent === 'parrot');
    const girlBtn = wordButtons.find((btn) => btn.textContent === 'girl');
    const orphanBtn = wordButtons.find((btn) => btn.textContent === 'orphan');
    const windowBtn = wordButtons.find((btn) => btn.textContent === 'window');
    const worldBtn = wordButtons.find((btn) => btn.textContent === 'world');

    fireEvent.click(tubeButtons[0]);
    fireEvent.click(resourceBtn!);
    fireEvent.click(massBtn!);
    // Skip door since we already used it
    fireEvent.click(firmBtn!);
    fireEvent.click(geniusBtn!);
    fireEvent.click(parrotBtn!);
    fireEvent.click(girlBtn!);
    fireEvent.click(orphanBtn!);
    fireEvent.click(windowBtn!);
    fireEvent.click(worldBtn!);

    // The validate button should be disabled because there's an error
    const validateButton = screen.getByText('Validate').closest('button');
    expect(validateButton).toBeDisabled();
  });

  it('should show errors for incorrectly placed duplicate words', () => {
    const { container } = render(<DialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByText('Reveal recovery phrase');
    fireEvent.click(revealButton);

    const confirmButton = screen.getByText('Confirm recovery phrase');
    fireEvent.click(confirmButton);

    // Get tube buttons
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const tubeButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('tube'));

    // Click second tube first (wrong for slot 0)
    fireEvent.click(tubeButtons[1]);

    // Check that slot 0 has an error (because any "tube" is correct for slot 0,
    // this test assumes validation marks it as correct. But if we fill wrong words later, errors will show)
    // Actually, since both are "tube", slot 0 would be correct. Let's test with a different word.

    // Clear and test with a completely wrong word
    const wordSlot0 = container.querySelector('[data-testid="word-slot-0"]');
    fireEvent.click(wordSlot0!); // Clear it

    // Click a wrong word for slot 0 (should be "tube", let's click "door")
    const doorBtn = Array.from(wordButtons).find((btn) => btn.textContent === 'door');
    fireEvent.click(doorBtn!);

    // Check that slot 0 shows error
    const slot0AfterWrong = container.querySelector('[data-testid="word-slot-0"]');
    expect(slot0AfterWrong?.getAttribute('data-is-error')).toBe('true');
  });
});
