'use client';

import { Button, Card, CopyButton, InfoCard, PageHeader } from '@/components/ui';
import { ArrowLeft, Eye, EyeOff, Shield, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useKeypairStore } from '@/core/stores';
import { AuthController } from '@/core/controllers/auth';
import { Logger } from '@/libs/logger';

export default function SeedBackup() {
  const { secretKey, hasGenerated } = useKeypairStore();
  const [showSeeds, setShowSeeds] = useState(false);
  const [verificationWords, setVerificationWords] = useState<string[]>(new Array(12).fill(''));
  const [isVerified, setIsVerified] = useState(false);
  const cachedSeedWords = useRef<string[]>([]);

  // Generate BIP39 seed words from secret key
  const seedWords = useMemo(() => {
    if (!secretKey || !hasGenerated || !(secretKey instanceof Uint8Array)) {
      return [];
    }

    // Return cached words if already generated for this secret key
    if (cachedSeedWords.current.length > 0) {
      Logger.debug('SeedBackup: Returning cached seed words to prevent duplicate generation');
      return cachedSeedWords.current;
    }

    try {
      // Use AuthController to generate seed words
      const words = AuthController.generateSeedWords(secretKey);

      // Cache the generated words to prevent double execution
      cachedSeedWords.current = words;

      return words;
    } catch (error) {
      Logger.error('SeedBackup: Failed to generate BIP39 seed words via AuthController', error);
      return [];
    }
  }, [secretKey, hasGenerated]);

  const hasSeedWords = useMemo(() => {
    return seedWords.length > 0;
  }, [seedWords]);

  const seedPhrase = useMemo(() => {
    return seedWords.join(' ');
  }, [seedWords]);

  const verificationProgress = useMemo(() => {
    const correctWords = verificationWords.filter((word, i) => seedWords[i] && word === seedWords[i]).length;
    return {
      correctCount: correctWords,
      total: 12,
      hasAnyInput: verificationWords.some((word) => word.length > 0),
    };
  }, [verificationWords, seedWords]);

  const buttonStates = useMemo(
    () => ({
      showSeedsText: showSeeds ? 'Hide' : 'Reveal',
      showSeedsIcon: showSeeds ? EyeOff : Eye,
      continueDisabled: !isVerified,
    }),
    [showSeeds, isVerified],
  );

  const displayTexts = useMemo(
    () => ({
      verificationStatus: isVerified
        ? 'Perfect! All words match your seed phrase. Now you can proceed to homeserver signup.'
        : `${verificationProgress.correctCount} of 12 words correct`,
      continueButtonText: isVerified ? 'Continue to homeserver signup' : 'Verify seed phrase to continue',
    }),
    [isVerified, verificationProgress.correctCount],
  );

  // Event handlers
  const handleToggleSeeds = () => {
    setShowSeeds(!showSeeds);
  };

  const handleVerificationChange = (index: number, value: string) => {
    const newWords = [...verificationWords];
    newWords[index] = value.toLowerCase().trim();
    setVerificationWords(newWords);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Always prevent default and handle the paste ourselves
    e.preventDefault();

    const newWords = [...verificationWords];

    if (words.length === 1) {
      // Single word - just fill the current field
      newWords[index] = words[0];
    } else if (words.length > 1) {
      // Multiple words - fill starting from current index
      for (let i = 0; i < words.length && index + i < 12; i++) {
        newWords[index + i] = words[i];
      }
    }

    setVerificationWords(newWords);
  };

  const getInputClassName = (word: string, index: number) => {
    const baseClass = 'flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md bg-background';

    if (!word || !seedWords[index]) {
      return `${baseClass} border-input`;
    }

    if (word === seedWords[index]) {
      return `${baseClass} border-green-500 text-green-600`;
    }

    return `${baseClass} border-red-500 text-red-600`;
  };

  // Effects
  useEffect(() => {
    if (seedWords.length === 0) {
      setIsVerified(false);
      return;
    }

    const hasAllWords = verificationWords.every((word) => word.length > 0);
    if (hasAllWords) {
      const allMatched = verificationWords.every((word, index) => word === seedWords[index]);
      setIsVerified(allMatched);
    } else {
      setIsVerified(false);
    }
  }, [verificationWords, seedWords]);

  return (
    <>
      {!hasSeedWords ? (
        <GeneratingSeed />
      ) : (
        <div className="flex flex-col gap-6">
          <PageHeader
            title={
              <>
                Backup with <span className="text-green-500">seed phrase</span>.
              </>
            }
            subtitle="Write down these 12 words in order to secure your account and keys."
          />

          <div className="flex flex-col gap-4">
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <Shield className="text-green-500 h-5 w-5" />
                    </div>
                    Seed Phrase Backup
                  </h3>
                  <p className="text-sm sm:text-base text-secondary-foreground opacity-80">
                    Your seed phrase is generated from your secret key and provides a human-readable backup.
                  </p>
                </div>

                <InfoCard title="Important Security Notes" icon={Shield} variant="amber" collapsible defaultCollapsed>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Write these words down on paper - never store digitally</li>
                    <li>Keep them in the exact order shown</li>
                    <li>Store in a safe, private location</li>
                    <li>Anyone with these words can access your account</li>
                  </ul>
                </InfoCard>

                {/* Seed Words Display */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h4 className="text-lg font-semibold text-foreground">Your Seed Phrase</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleSeeds}
                        className="rounded-full text-xs sm:text-sm"
                      >
                        <buttonStates.showSeedsIcon className="mr-2 h-4 w-4" />
                        {buttonStates.showSeedsText}
                      </Button>
                      <CopyButton text={seedPhrase} className="rounded-full" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {seedWords.map((word, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg bg-muted/30"
                      >
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground w-4 sm:w-6">
                          {index + 1}.
                        </span>
                        <span className="font-mono text-xs sm:text-sm text-foreground flex-1">
                          {showSeeds ? word : '•••••••'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-foreground">Verify Your Backup</h4>
                    {isVerified && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Type each word in the correct order to verify you&apos;ve written them down correctly. Once
                    verified, you&apos;ll proceed to sign up for a homeserver to complete your account setup.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {verificationWords.map((word, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground w-4 sm:w-6">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          placeholder="word"
                          value={word}
                          onChange={(e) => handleVerificationChange(index, e.target.value)}
                          onPaste={(e) => handlePaste(e, index)}
                          className={getInputClassName(word, index)}
                        />
                      </div>
                    ))}
                  </div>

                  {verificationProgress.hasAnyInput && (
                    <div className="flex items-start sm:items-center gap-2 p-3 rounded-lg bg-muted/30">
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-xs sm:text-sm font-medium text-green-600">
                            {displayTexts.verificationStatus}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {displayTexts.verificationStatus}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
            <Button variant="secondary" size="lg" className="rounded-full w-full sm:w-auto" asChild>
              <Link href="/onboarding/keys">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              size="lg"
              className="rounded-full w-full sm:w-auto"
              disabled={buttonStates.continueDisabled}
              asChild={isVerified}
            >
              {isVerified ? (
                <Link href="/onboarding/homeserver">
                  <span className="hidden sm:inline">{displayTexts.continueButtonText}</span>
                  <span className="sm:hidden">Continue to homeserver</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <div className="flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{displayTexts.continueButtonText}</span>
                  <span className="sm:hidden">Verify seed phrase</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

const GeneratingSeed = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <>
            Backup with <span className="text-green-500">seed phrase</span>.
          </>
        }
        subtitle="Generating your seed phrase from your secret key..."
      />

      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-500"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Generating BIP39 seed words...</p>
        </div>
      </Card>
    </div>
  );
};
