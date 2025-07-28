'use client';

import Image from 'next/image';
import { Button, ButtonsNavigation, Card } from '@/components/ui';
import { Key } from 'lucide-react';

interface ScanContentProps {
  className?: string;
  onHandleBackButton?: () => void;
}

export function ScanContent({
  className = 'container mx-auto px-6 lg:px-10 lg:pt-8',
  onHandleBackButton,
}: ScanContentProps) {
  return (
    <main className={className}>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
        {/* Desktop */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl lg:text-[60px] font-bold leading-tight">
              Scan <span className="text-brand block lg:inline">QR Code.</span>
            </h1>
            <h2 className="text-xl lg:text-2xl text-muted-foreground font-light leading-normal">
              Open Pubky Ring, create a pubky, and scan the QR.
            </h2>
          </div>

          {/* Card */}
          <Card className="p-6 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
              <Image src="/images/pubky-ring-qr-example.png" alt="Pubky Ring" width={220} height={220} />
            </div>
          </Card>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl lg:text-[60px] font-bold leading-tight">
              Tap to <span className="text-brand block lg:inline">Authorize.</span>
            </h1>
            <h2 className="text-xl lg:text-2xl text-muted-foreground font-light leading-normal">
              Open Pubky Ring, create a pubky, and scan the QR.
            </h2>
          </div>

          {/* Card */}
          <Card className="p-6 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-center">
              <Image src="/images/logo-pubky-ring.svg" alt="Pubky Ring" width={137} height={30} />
              <Button className="w-full h-[60px] rounded-full" size="lg">
                <Key className="mr-2 h-4 w-4" />
                Authorize with Pubky Ring
              </Button>
            </div>
          </Card>
        </div>

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
          –powered keychain.
        </p>

        {/* Navigation */}
        <ButtonsNavigation
          onHandleBackButton={onHandleBackButton}
          backText="Back"
          continueText="Continue"
          backButtonDisabled={false}
          continueButtonDisabled={true}
          hiddenContinueButton={true}
        />
      </div>
    </main>
  );
}
