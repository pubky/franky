'use client';

import { ArrowLeft, FileKey, Globe, KeyRound, Lock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useMemo } from 'react';
import { Button, Card, CopyButton, InfoCard, KeyDisplay, PageHeader } from '@/components/ui';
import { useOnboardingStore, useProfileStore } from '@/core/stores';
import { Identity } from '@/libs';

export default function CreateAccountReady() {
  const { publicKey, secretKey, isGenerating, hasHydrated, hasGenerated, setPublicKey, setSecretKey } =
    useOnboardingStore();
  const { setCurrentUserPubky } = useProfileStore();
  const hasTriedGeneration = useRef(false);

  // Computed values - move all logic here
  const isValidSecretKey = useMemo(() => {
    return secretKey && secretKey.length === 64;
  }, [secretKey]);

  const displayTexts = useMemo(
    () => ({
      publicKey: publicKey || 'Generating...',
      secretKey: isValidSecretKey ? secretKey : 'Generating...',
    }),
    [publicKey, isValidSecretKey, secretKey],
  );

  const buttonStates = useMemo(
    () => ({
      regenerateDisabled: isGenerating,
      regenerateIcon: isGenerating ? 'animate-spin' : '',
    }),
    [isGenerating],
  );

  // Helper function to check if keys are persisted in localStorage
  const areKeysPersisted = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    try {
      const stored = localStorage.getItem('onboarding-storage');
      if (!stored) return false;

      const parsed = JSON.parse(stored);
      return !!(parsed.state?.secretKey && parsed.state?.hasGenerated);
    } catch {
      return false;
    }
  };

  // Effects
  useEffect(() => {
    // Wait for hydration to complete before checking for keys
    if (!hasHydrated) {
      return;
    }

    const hasValidInMemoryKeys = isValidSecretKey && hasGenerated;
    const hasPersistedKeys = areKeysPersisted();

    // Case 1: Keys exist in memory but NOT in localStorage (manual deletion scenario)
    if (hasValidInMemoryKeys && !hasPersistedKeys) {
      // The stores should handle persistence automatically
      // Just trigger a state update to ensure persistence
      useOnboardingStore.setState({
        secretKey,
        hasGenerated,
      });
      return;
    }

    // Case 2: If we have a valid secretKey but no publicKey, derive it
    if (isValidSecretKey && !publicKey) {
      try {
        const keypair = Identity.keypairFromSecretKey(secretKey);
        setPublicKey(keypair.publicKey);
      } catch (error) {
        console.error('Failed to derive publicKey from secretKey:', error);
      }
      return;
    }

    // Case 3: No valid keys - need to generate them
    const needsKeyGeneration = !hasValidInMemoryKeys;

    // Only generate keys if we need them, we're not already generating, and we haven't tried yet
    if (needsKeyGeneration && !isGenerating && !hasTriedGeneration.current) {
      hasTriedGeneration.current = true;
      const { secretKey, publicKey } = Identity.generateKeypair();
      setPublicKey(publicKey);
      setSecretKey(secretKey);
      setCurrentUserPubky(publicKey);
    }

    // Reset the flag if we have valid keys
    if (hasValidInMemoryKeys) {
      hasTriedGeneration.current = false;
    }
  }, [
    isValidSecretKey,
    hasGenerated,
    isGenerating,
    hasHydrated,
    publicKey,
    secretKey,
    setPublicKey,
    setSecretKey,
    setCurrentUserPubky,
  ]);

  // Event handlers
  const handleRegenerateKeys = () => {
    const { secretKey, publicKey } = Identity.generateKeypair();
    setPublicKey(publicKey);
    setSecretKey(secretKey);
    setCurrentUserPubky(publicKey);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <>
            Your keys, <span className="text-green-500">your identity</span>.
          </>
        }
        subtitle="We've generated a unique key pair just for you. Keep them safe!"
        action={
          <Button
            variant="outline"
            size="sm"
            className="rounded-full p-6 w-50 cursor-pointer"
            onClick={handleRegenerateKeys}
            disabled={buttonStates.regenerateDisabled}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${buttonStates.regenerateIcon}`} />
            Generate new keys
          </Button>
        }
      />

      <div className="gap-4 flex flex-col">
        <Card className="flex-1 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Globe className="text-green-500 h-5 w-5" />
                  </div>
                  Public Key
                </h3>
                <p className="text-base text-secondary-foreground opacity-80">
                  Share your pubky with your friends so they can follow you.
                </p>
              </div>
              <KeyDisplay text={displayTexts.publicKey} />
              <CopyButton text={publicKey} />
            </div>
          </div>
          <div className="h-px bg-border"></div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Lock className="text-green-500 h-5 w-5" />
                  </div>
                  Secret Key
                </h3>
                <p className="text-base text-secondary-foreground opacity-80">
                  Use this key to sign in and authenticate your account. Keep it private and secure.
                </p>
                <InfoCard
                  title="Why is this important?"
                  icon={Lock}
                  variant="amber"
                  className="mt-2"
                  collapsible
                  defaultCollapsed
                >
                  <p>
                    Your secret key is like a master password. Anyone with access to it can control your account
                    completely.
                  </p>
                </InfoCard>
              </div>
              <KeyDisplay text={displayTexts.secretKey} isSecret={true} />
              <CopyButton text={secretKey} />
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
