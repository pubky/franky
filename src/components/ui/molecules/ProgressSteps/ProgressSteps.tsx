'use client';

import { Check } from 'lucide-react';
import { cn } from '@/libs';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressSteps({ currentStep, totalSteps, className }: ProgressStepsProps) {
  return (
    <>
      {/* Progress Steps - Desktop */}
      <div className={cn('hidden lg:flex items-center gap-4 mt-1', className)}>
        <div className="flex items-center gap-0">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full font-bold transition-all duration-500 ease-in-out transform mr-[3px]',
                    isActive ? 'bg-foreground text-background' : 'border text-muted-foreground',
                    isCompleted && 'bg-transparent text-white border-white !mr-0',
                  )}
                >
                  <div
                    className={cn(
                      'transition-all duration-500 ease-in-out',
                      isCompleted ? 'animate-in fade-in zoom-in duration-500' : '',
                    )}
                  >
                    {isCompleted ? <Check size={16} /> : stepNumber}
                  </div>
                </div>
                {stepNumber < totalSteps && (
                  <div className="relative w-24 xl:w-64 h-px overflow-hidden">
                    {/* Base line (gray) */}
                    <div className="absolute inset-0 bg-border opacity-50" />

                    {/* Animated line (white) */}
                    <div
                      className={cn(
                        'absolute inset-0 bg-white transform transition-all duration-500 ease-out',
                        stepNumber < currentStep ? 'translate-x-0' : '-translate-x-full',
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Steps - Mobile */}
      <div className={cn('flex lg:hidden items-center gap-0 mt-2.5', className)}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isFirst = stepNumber === 1;
          const isLast = stepNumber === totalSteps;

          return (
            <div
              key={stepNumber}
              className={cn(
                'relative w-8 h-4 bg-border overflow-hidden',
                isFirst && 'rounded-l-full',
                isLast && 'rounded-r-full',
              )}
            >
              {/* Growing fill bar */}
              <div
                className={cn(
                  'absolute inset-0 bg-foreground transition-transform duration-800 ease-out origin-left',
                  isActive || isCompleted ? 'scale-x-100' : 'scale-x-0',
                )}
                style={{
                  transitionDelay: isActive || isCompleted ? `${stepNumber * 150}ms` : '0ms',
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
