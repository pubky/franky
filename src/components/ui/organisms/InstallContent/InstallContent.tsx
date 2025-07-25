'use client';

import Image from 'next/image';
import { Card, StoreButtons, InstallNavigation } from '@/components/ui';

interface InstallContentProps {
  className?: string;
  onCreateKeysInBrowser?: () => void;
  onContinueWithPubkyRing?: () => void;
}

export function InstallContent({
  className = 'container mx-auto px-6 lg:px-6 pt-12',
  onCreateKeysInBrowser,
  onContinueWithPubkyRing,
}: InstallContentProps) {
  return (
    <main className={className}>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl lg:text-[60px] font-bold leading-tight">
            Install <span className="text-brand block lg:inline">Pubky Ring.</span>
          </h1>
          <h2 className="text-xl lg:text-2xl text-muted-foreground font-light leading-normal">
            Pubky Ring is a keychain for your identity keys in the Pubky ecosystem.
          </h2>
        </div>

        {/* Card */}
        <Card className="p-6 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Image */}
            <div className="w-full lg:w-[192px] hidden lg:flex">
              <Image src="/images/keyring.png" alt="Keyring" className="w-full h-auto" width={192} height={192} />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={220} height={48} />
                <p className="text-secondary-foreground opacity-80">
                  Download and install the mobile app to start creating your account.
                </p>
              </div>

              {/* Store Buttons */}
              <StoreButtons />
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-sm text-muted-foreground opacity-80">
          Use{' '}
          <a href="https://www.pubkyring.to/" className="text-brand" target="_blank">
            Pubky Ring
          </a>{' '}
          or any other{' '}
          <a href="https://pubky.org" className="text-brand" target="_blank">
            Pubky Core
          </a>
          –powered keychain, or create your keys in the browser (less secure).
        </p>

        {/* Navigation */}
        <InstallNavigation
          onCreateKeysInBrowser={onCreateKeysInBrowser}
          onContinueWithPubkyRing={onContinueWithPubkyRing}
        />
      </div>
    </main>
  );
}
