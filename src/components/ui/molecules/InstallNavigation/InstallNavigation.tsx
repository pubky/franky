'use client';

import { ArrowRight, AppWindow } from 'lucide-react';
import { Button, PopoverTradeoffs } from '@/components/ui';

interface InstallNavigationProps {
  className?: string;
  onCreateKeysInBrowser?: () => void;
  onContinueWithPubkyRing?: () => void;
  createKeysText?: string;
  continueText?: string;
}

export function InstallNavigation({
  className = 'flex flex-col-reverse lg:flex-row gap-3 lg:gap-6 justify-between',
  onCreateKeysInBrowser,
  onContinueWithPubkyRing,
  createKeysText = 'Create keys in browser',
  continueText = 'Continue with Pubky Ring',
}: InstallNavigationProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1 w-full xl:w-auto">
        <Button variant="outline" className="rounded-full flex-1 md:flex-none" onClick={onCreateKeysInBrowser}>
          <AppWindow className="mr-2 h-4 w-4" />
          {createKeysText}
        </Button>
        <PopoverTradeoffs />
      </div>
      <Button size="lg" className="rounded-full" onClick={onContinueWithPubkyRing}>
        <ArrowRight className="mr-2 h-4 w-4" />
        {continueText}
      </Button>
    </div>
  );
}
