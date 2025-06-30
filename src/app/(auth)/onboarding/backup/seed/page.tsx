'use client';

import { Button, Card, CopyButton } from '@/components/ui';
import { ArrowLeft, Eye, EyeOff, Shield, CheckCircle2, ArrowRight, Lock, AlertCircle } from 'lucide-react';
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

  const seedPhrase = seedWords.join(' ');

  if (!hasGenerated || !secretKey || !(secretKey instanceof Uint8Array)) {
    return <NoSeed />;
  }

  // Show loading state while generating seed words
  if (seedWords.length === 0) {
    return <GeneratingSeed />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-6xl font-bold text-foreground">
          Backup with <span className="text-green-500">seed phrase</span>.
        </h1>
        <p className="text-2xl text-muted-foreground">
          Write down these 12 words in order to secure your account and keys.
        </p>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="text-green-500 h-5 w-5" />
                Seed Phrase Backup
              </h3>
              <p className="text-base text-secondary-foreground opacity-80">
                Your seed phrase is generated from your secret key and provides a human-readable backup.
              </p>
            </div>

            <div className="bg-muted/50 border-l-4 border-l-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <div className="text-amber-600 mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Important Security Notes</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Write these words down on paper - never store digitally</li>
                  <li>Keep them in the exact order shown</li>
                  <li>Store in a safe, private location</li>
                  <li>Anyone with these words can access your account</li>
                </ul>
              </div>
            </div>

            {/* Seed Words Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground">Your Seed Phrase</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowSeeds(!showSeeds)} className="rounded-full">
                    {showSeeds ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Reveal
                      </>
                    )}
                  </Button>
                  <CopyButton text={seedPhrase} className="rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {seedWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                    <span className="font-mono text-sm text-foreground">{showSeeds ? word : '•••••••'}</span>
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
              <p className="text-sm text-muted-foreground">
                Type each word in the correct order to verify you&apos;ve written them down correctly. Once verified,
                you&apos;ll proceed to sign up for a homeserver to complete your account setup.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {verificationWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                    <input
                      type="text"
                      placeholder="word"
                      value={word}
                      onChange={(e) => handleVerificationChange(index, e.target.value)}
                      onPaste={(e) => handlePaste(e, index)}
                      className={`flex-1 px-3 py-2 text-sm border rounded-md bg-background ${
                        word && seedWords[index] && word === seedWords[index]
                          ? 'border-green-500 text-green-600'
                          : word && seedWords[index] && word !== seedWords[index]
                            ? 'border-red-500 text-red-600'
                            : 'border-input'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {verificationWords.some((word) => word.length > 0) && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        Perfect! All words match your seed phrase. Now you can proceed to homeserver signup.
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      <span className="text-sm text-muted-foreground">
                        {verificationWords.filter((word, i) => seedWords[i] && word === seedWords[i]).length} of 12
                        words correct
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="lg" className="rounded-full" asChild>
          <Link href="/onboarding/keys">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button size="lg" className="rounded-full" disabled={!isVerified} asChild={isVerified}>
          {isVerified ? (
            <Link href="/onboarding/homeserver">
              Continue to homeserver signup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div className="flex items-center">
              <Lock className="mr-2 h-4 w-4" />
              Verify seed phrase to continue
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

const NoSeed = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-6xl font-bold text-foreground">
          Backup with <span className="text-green-500">seed phrase</span>.
        </h1>
        <p className="text-2xl text-muted-foreground">
          Write down these 12 words in order to secure your account and keys.
        </p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h3 className="text-xl font-semibold">No Keys Available</h3>
          <p className="text-muted-foreground max-w-md">
            You need to generate your keys first before creating a seed phrase backup.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/onboarding/keys">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Generate Keys First
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

const GeneratingSeed = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-6xl font-bold text-foreground">
          Backup with <span className="text-green-500">seed phrase</span>.
        </h1>
        <p className="text-2xl text-muted-foreground">Generating your seed phrase from your secret key...</p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-muted-foreground">Generating BIP39 seed words...</p>
        </div>
      </Card>
    </div>
  );
};
