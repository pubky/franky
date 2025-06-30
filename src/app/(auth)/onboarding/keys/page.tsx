'use client';

import { ArrowLeft, FileKey, Globe, KeyRound, Lock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Button, Card, CopyButton, KeyDisplay } from '@/components/ui';
import { useKeypairStore } from '@/core/stores';

export default function CreateAccountReady() {
  const { publicKey, secretKey, isGenerating, hasHydrated, generateKeys } = useKeypairStore();
  const hasTriedGeneration = useRef(false);

  useEffect(() => {
    // Wait for hydration to complete before checking for keys
    if (!hasHydrated) {
      return;
    }

    // Check if we have valid keys after hydration
    const hasValidSecretKey = secretKey && secretKey instanceof Uint8Array && secretKey.length === 32;

    // Only generate keys if we don't have valid ones, we're not already generating, and we haven't tried yet
    if (!hasValidSecretKey && !isGenerating && !hasTriedGeneration.current) {
      hasTriedGeneration.current = true;
      generateKeys();
    }

    // Reset the flag if we have valid keys
    if (hasValidSecretKey) {
      hasTriedGeneration.current = false;
    }
  }, [secretKey, isGenerating, hasHydrated, generateKeys]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-6xl font-bold text-foreground">
            Your keys, <span className="text-green-500">your identity</span>.
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full p-6 w-50 cursor-pointer"
            onClick={() => generateKeys(true)}
            disabled={isGenerating}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {'Generate new keys'}
          </Button>
        </div>
        <h2 className="text-2xl text-muted-foreground">
          We&apos;ve generated a unique key pair just for you. Keep them safe!
        </h2>
      </div>

      <div className="gap-4 flex flex-col">
        <Card className="flex-1 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Globe className="text-green-500 h-5 w-5" />
                  Public Key
                </h3>
                <p className="text-base text-secondary-foreground opacity-80">
                  Share your pubky with your friends so they can follow you.
                </p>
              </div>
              <KeyDisplay text={publicKey || 'Generating...'} />
              <CopyButton text={publicKey} />
            </div>
          </div>
          <div className="h-px bg-border"></div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Lock className="text-green-500 h-5 w-5" />
                  Secret Key
                </h3>
                <p className="text-base text-secondary-foreground opacity-80">
                  Use this key to sign in and authenticate your account. Keep it private and secure.
                </p>
                <div className="bg-muted border-l-4 border-l-amber-500/30 rounded-lg p-4 flex items-start gap-3 mt-2">
                  <div className="text-amber-600 mt-0.5">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Why is this important?</p>
                    <p className="text-sm text-muted-foreground">
                      Your secret key is like a master password. Anyone with access to it can control your account
                      completely.
                    </p>
                  </div>
                </div>
              </div>
              <KeyDisplay
                text={
                  secretKey && secretKey instanceof Uint8Array
                    ? Buffer.from(secretKey).toString('hex')
                    : 'Generating...'
                }
                isSecret={true}
              />

              <CopyButton
                text={secretKey && secretKey instanceof Uint8Array ? Buffer.from(secretKey).toString('hex') : ''}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0 md:justify-between">
        <Button variant="secondary" size="lg" className="rounded-full w-full md:w-auto" asChild>
          <Link href="/onboarding">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <Button size="lg" className="rounded-full w-full md:w-auto" asChild>
            <Link href="/onboarding/backup/seed">
              <KeyRound className="mr-2 h-4 w-4" />
              Backup 12-Word Seed
            </Link>
          </Button>
          <span className="text-muted-foreground">or</span>
          <Button size="lg" className="rounded-full w-full md:w-auto" asChild>
            <Link href="/onboarding/backup/file">
              <FileKey className="mr-2 h-4 w-4" />
              Backup Encrypted File
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
