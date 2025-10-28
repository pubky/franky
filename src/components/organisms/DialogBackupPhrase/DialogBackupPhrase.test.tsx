import { describe, it, expect, vi } from 'vitest';
import { useState, useEffect } from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { DialogBackupPhrase } from './DialogBackupPhrase';
import { useRecoveryPhraseValidation } from '@/hooks';

const dialogMockControls: {
  onOpenChange?: (open: boolean) => void;
} = {};

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

// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
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
  Dialog: ({ children, onOpenChange }: { children: React.ReactNode; onOpenChange?: (open: boolean) => void }) => {
    dialogMockControls.onOpenChange = onOpenChange;
    return <div data-testid="dialog">{children}</div>;
  },
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  DialogContent: ({
    children,
    className,
    hiddenTitle,
  }: {
    children: React.ReactNode;
    className?: string;
    hiddenTitle?: string;
  }) => (
    <div data-testid="dialog-content" className={className} data-hidden-title={hiddenTitle}>
      {hiddenTitle && (
        <h2 className="sr-only" data-testid="dialog-hidden-title">
          {hiddenTitle}
        </h2>
      )}
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
  DialogFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
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

  it('should hide recovery phrase when dialog is closed and reopened', () => {
    const { container } = render(<DialogBackupPhrase />);

    const revealButton = screen.getByText('Reveal recovery phrase');
    fireEvent.click(revealButton);

    const wordBadge = container.querySelector('[data-testid="badge"]');
    expect(wordBadge).toBeTruthy();

    const wordContainer = wordBadge?.closest('[data-testid="container"]') as HTMLElement | null;
    expect(wordContainer).not.toBeNull();

    const wordsGrid = wordContainer?.parentElement as HTMLElement | null;
    expect(wordsGrid).not.toBeNull();

    const outerContainer = wordsGrid?.parentElement as HTMLElement | null;

    expect(outerContainer).not.toBeNull();
    expect(outerContainer?.className ?? '').not.toContain('blur-xs');
    expect(screen.getByText('Hide recovery phrase')).toBeInTheDocument();

    act(() => {
      dialogMockControls.onOpenChange?.(false);
    });

    act(() => {
      dialogMockControls.onOpenChange?.(true);
    });

    expect(screen.getByText('Reveal recovery phrase')).toBeInTheDocument();
    expect(screen.queryByText('Hide recovery phrase')).not.toBeInTheDocument();
    const updatedOuterContainer = wordContainer?.parentElement?.parentElement as HTMLElement | null;
    expect(updatedOuterContainer).not.toBeNull();
    expect(updatedOuterContainer?.className ?? '').toContain('blur-xs');
  });

  it('should allow selecting duplicate words individually in step 2', () => {
    const { container } = render(<DialogBackupPhrase />);

    // First, reveal the recovery phrase and go to step 2
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
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
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
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
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
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
    const validateButton = screen.getByRole('button', { name: /validate/i });
    expect(validateButton).toBeDisabled();
  });

  it('should show an error when a wrong word is selected for slot 0', () => {
    const { container } = render(<DialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
    fireEvent.click(confirmButton);

    // Select a wrong word for slot 0 (expected "tube")
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const doorBtn = Array.from(wordButtons).find((btn) => btn.textContent === 'door');
    fireEvent.click(doorBtn!);

    // Assert slot 0 shows error
    const slot0 = container.querySelector('[data-testid="word-slot-0"]');
    expect(slot0?.getAttribute('data-is-error')).toBe('true');
  });
});

describe('DialogBackupPhrase - Identical Words Test', () => {
  // Create a test component that uses identical words
  const TestDialogBackupPhrase = () => {
    const [isHidden, setIsHidden] = useState(true);
    const [recoveryWords, setRecoveryWords] = useState<string[]>([]);
    const [step, setStep] = useState(1);

    useEffect(() => {
      // Use 12 identical words for testing
      setRecoveryWords([
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
        'bacon',
      ]);
    }, []);

    return (
      <div data-testid="dialog">
        <div data-testid="dialog-trigger" data-as-child={true}>
          <button data-testid="button-default" className="gap-2">
            <span>Continue</span>
          </button>
        </div>
        <div data-testid="dialog-content" className="gap-6 p-8">
          {step === 1 && (
            <div>
              <div data-testid="dialog-header" className="space-y-1.5 pr-6">
                <h2 data-testid="dialog-title" className="text-2xl font-bold leading-8 sm:text-xl sm:leading-7">
                  Backup recovery phrase
                </h2>
                <p data-testid="dialog-description" className="text-sm leading-5 max-w-[530px]">
                  Use the recovery phrase below to recover your account at a later date. Write down these 12 words in
                  the correct order and store them in a safe place.{' '}
                  <span className="text-brand font-bold">Never share this recovery phrase with anyone.</span>
                </p>
              </div>

              <div data-testid="container" className={isHidden ? 'blur-xs' : ''}>
                <div data-testid="container" className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {recoveryWords.map((word, index) => (
                    <div key={index} className="items-center gap-3 rounded-md bg-secondary p-4 flex-row">
                      <span
                        data-testid="badge"
                        data-variant="outline"
                        className="h-5 min-w-[20px] rounded-full px-1 font-semibold"
                      >
                        {index + 1}
                      </span>
                      <span className="text-base font-medium">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div data-testid="container" className="gap-4 sm:gap-3 md:flex-row justify-between">
                {isHidden ? (
                  <>
                    <div data-testid="dialog-close" data-as-child={true}>
                      <button
                        data-testid="button-outline"
                        className="order-2 md:order-0 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
                      >
                        Cancel
                      </button>
                    </div>
                    <button
                      data-testid="button-default"
                      className="order-1 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
                      onClick={() => {
                        setIsHidden(!isHidden);
                        setStep(1);
                      }}
                    >
                      <div data-testid="eye-icon" className="mr-2 h-4 w-4">
                        Eye
                      </div>
                      Reveal recovery phrase
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      data-testid="button-outline"
                      className="order-2 md:order-0 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
                      onClick={() => {
                        setIsHidden(!isHidden);
                        setStep(1);
                      }}
                    >
                      <div data-testid="eye-off-icon" className="mr-2 h-4 w-4">
                        EyeOff
                      </div>
                      Hide recovery phrase
                    </button>
                    <button
                      data-testid="button-default"
                      className="order-1 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
                      onClick={() => setStep(2)}
                    >
                      <div data-testid="arrow-right-icon" className="mr-2 h-4 w-4">
                        ArrowRight
                      </div>
                      Confirm recovery phrase
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {step === 2 && <RecoveryStep2Test recoveryWords={recoveryWords} setStep={setStep} />}
          {step === 3 && <div>Step 3</div>}
        </div>
      </div>
    );
  };

  // Test version of RecoveryStep2 with identical words using the hook
  const RecoveryStep2Test = ({
    recoveryWords,
    setStep,
  }: {
    recoveryWords: string[];
    setStep: (step: number) => void;
  }) => {
    const {
      userWords,
      errors,
      availableWords,
      usedWordInstances,
      handleWordClick,
      validateWords,
      clearWord,
      isComplete,
    } = useRecoveryPhraseValidation({ recoveryWords });

    return (
      <>
        <div data-testid="dialog-header" className="space-y-1.5 pr-6">
          <h2 data-testid="dialog-title" className="text-2xl sm:text-[24px] font-bold">
            Confirm recovery phrase
          </h2>
          <p data-testid="dialog-description" className="text-sm text-muted-foreground">
            Click or tap the 12 words in the correct order. Click on filled fields to remove words.
          </p>
        </div>

        <div data-testid="container" className="space-y-6">
          <div data-testid="container" className="flex-wrap gap-2 flex-row">
            {availableWords.map((word, index) => {
              const isThisInstanceUsed = usedWordInstances.has(index);

              return (
                <button
                  data-testid={`button-${isThisInstanceUsed ? 'secondary' : 'outline'}`}
                  key={`${word}-${index}`}
                  className={`rounded-full ${
                    isThisInstanceUsed
                      ? 'opacity-40 bg-transparent border text-muted-foreground cursor-not-allowed'
                      : 'dark:border-transparent bg-secondary cursor-pointer'
                  }`}
                  onClick={() => !isThisInstanceUsed && handleWordClick(word, index)}
                  disabled={isThisInstanceUsed}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <div data-testid="container" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userWords.map((word, i) => {
              const isCorrect = word !== '' && word === recoveryWords[i];
              const isError = errors[i];
              return (
                <div
                  key={i}
                  data-testid={`word-slot-${i}`}
                  data-mode="readonly"
                  data-word={word}
                  data-is-correct={isCorrect}
                  data-is-error={isError}
                  onClick={() => clearWord(i)}
                >
                  {word || `Slot ${i + 1}`}
                </div>
              );
            })}
          </div>
        </div>

        <div data-testid="container" className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <button data-testid="button-outline" className="rounded-full flex-1" onClick={() => setStep(1)}>
            <div data-testid="arrow-left-icon" className="mr-2 h-4 w-4">
              ArrowLeft
            </div>
            Back
          </button>
          <button
            data-testid="button-default"
            className="rounded-full flex-1"
            onClick={() => {
              if (validateWords()) {
                setStep(3);
              }
            }}
            disabled={!isComplete}
          >
            <div data-testid="check-icon" className="mr-2 h-4 w-4">
              Check
            </div>
            Validate
          </button>
        </div>
      </>
    );
  };

  it('should handle 12 identical words correctly', () => {
    const { container } = render(<TestDialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
    fireEvent.click(confirmButton);

    // Get all bacon buttons (should be 12)
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const baconButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('bacon'));

    // Should have 12 instances of "bacon" button
    expect(baconButtons).toHaveLength(12);

    // All should be clickable initially
    baconButtons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });

    // Click the first bacon button
    fireEvent.click(baconButtons[0]);

    // Only the first button should be disabled, others should still be clickable
    expect(baconButtons[0]).toBeDisabled();
    baconButtons.slice(1).forEach((button) => {
      expect(button).not.toBeDisabled();
    });

    // Click the second bacon button
    fireEvent.click(baconButtons[1]);

    // First two should be disabled, others should still be clickable
    expect(baconButtons[0]).toBeDisabled();
    expect(baconButtons[1]).toBeDisabled();
    baconButtons.slice(2).forEach((button) => {
      expect(button).not.toBeDisabled();
    });

    // Continue clicking all buttons
    for (let i = 2; i < baconButtons.length; i++) {
      fireEvent.click(baconButtons[i]);
    }

    // All buttons should now be disabled
    baconButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    // All slots should be filled with "bacon"
    for (let i = 0; i < 12; i++) {
      const wordSlot = container.querySelector(`[data-testid="word-slot-${i}"]`);
      expect(wordSlot?.getAttribute('data-word')).toBe('bacon');
    }

    // Validate should be enabled and clicking it should advance to Step 3
    const validate = screen.getByRole('button', { name: /validate/i });
    expect(validate).not.toBeDisabled();
    fireEvent.click(validate);
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('should re-enable correct instance when clearing a slot with identical words', () => {
    const { container } = render(<TestDialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
    fireEvent.click(confirmButton);

    // Get all bacon buttons
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const baconButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('bacon'));

    // Click first 3 buttons
    fireEvent.click(baconButtons[0]);
    fireEvent.click(baconButtons[1]);
    fireEvent.click(baconButtons[2]);

    // First 3 should be disabled
    expect(baconButtons[0]).toBeDisabled();
    expect(baconButtons[1]).toBeDisabled();
    expect(baconButtons[2]).toBeDisabled();

    // Clear the first slot (slot 0)
    const wordSlot0 = container.querySelector('[data-testid="word-slot-0"]');
    fireEvent.click(wordSlot0!);

    // Only the first bacon button should be re-enabled
    expect(baconButtons[0]).not.toBeDisabled();
    expect(baconButtons[1]).toBeDisabled();
    expect(baconButtons[2]).toBeDisabled();

    // Clear the second slot (slot 1)
    const wordSlot1 = container.querySelector('[data-testid="word-slot-1"]');
    fireEvent.click(wordSlot1!);

    // First two buttons should be re-enabled
    expect(baconButtons[0]).not.toBeDisabled();
    expect(baconButtons[1]).not.toBeDisabled();
    expect(baconButtons[2]).toBeDisabled();
  });

  it('should handle reverse-order selection with identical words', () => {
    const { container } = render(<TestDialogBackupPhrase />);

    // Navigate to step 2
    const revealButton = screen.getByRole('button', { name: /reveal recovery phrase/i });
    fireEvent.click(revealButton);

    const confirmButton = screen.getByRole('button', { name: /confirm recovery phrase/i });
    fireEvent.click(confirmButton);

    // Get all bacon buttons
    const wordButtons = container.querySelectorAll('button[data-testid^="button-"]');
    const baconButtons = Array.from(wordButtons).filter((button) => button.textContent?.includes('bacon'));

    // Click from the end towards the start
    const last = baconButtons.length - 1;
    fireEvent.click(baconButtons[last]);
    // Only the last should be disabled
    expect(baconButtons[last]).toBeDisabled();
    expect(baconButtons[last - 1]).not.toBeDisabled();

    fireEvent.click(baconButtons[last - 1]);
    // The last two should be disabled, the third-from-last enabled
    expect(baconButtons[last]).toBeDisabled();
    expect(baconButtons[last - 1]).toBeDisabled();
    expect(baconButtons[last - 2]).not.toBeDisabled();

    // Click a few more in reverse to ensure mapping stays correct
    fireEvent.click(baconButtons[last - 2]);
    fireEvent.click(baconButtons[last - 3]);

    expect(baconButtons[last]).toBeDisabled();
    expect(baconButtons[last - 1]).toBeDisabled();
    expect(baconButtons[last - 2]).toBeDisabled();
    expect(baconButtons[last - 3]).toBeDisabled();

    // Clear slot 0 and 1, ensure only the earliest clicked instances re-enable
    const slot0 = container.querySelector('[data-testid="word-slot-0"]');
    const slot1 = container.querySelector('[data-testid="word-slot-1"]');
    fireEvent.click(slot0!);
    fireEvent.click(slot1!);

    // After clearing first two slots, the last two clicked instances should re-enable,
    // and the earlier reverse-clicked instances should remain disabled
    expect(baconButtons[last]).not.toBeDisabled();
    expect(baconButtons[last - 1]).not.toBeDisabled();
    expect(baconButtons[last - 2]).toBeDisabled();
    expect(baconButtons[last - 3]).toBeDisabled();
  });
});
