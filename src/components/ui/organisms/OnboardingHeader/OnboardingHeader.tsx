'use client';

import Link from 'next/link';
import { Logo, ProgressSteps } from '@/components/ui';

interface OnboardingHeaderProps {
  title?: string;
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function OnboardingHeader({
  title = 'Identity keys',
  currentStep,
  totalSteps,
  className = '',
}: OnboardingHeaderProps) {
  return (
    <header className={`w-full ${className}`}>
      <div className="container mx-auto px-6 lg:px-10 py-6.5">
        <nav className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center w-36 h-10">
              <Logo />
            </div>
          </Link>

          {/* Title - Desktop */}
          <div className="hidden sm:flex items-center gap-1 w-full sm:h-16 mt-1">
            <h2 className="text-2xl font-light text-muted-foreground">{title}</h2>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />
        </nav>
      </div>
    </header>
  );
}
