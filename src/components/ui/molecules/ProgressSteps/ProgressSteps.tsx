'use client';

import { Check } from 'lucide-react';
import { cn } from '@/libs';
import { Container } from '@/components/ui';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressSteps({ currentStep, totalSteps, className }: ProgressStepsProps) {
  return (
    <>
      {/* Progress Steps - Desktop */}
      <Container className={cn('hidden lg:flex items-center gap-4 mt-1 flex-1', className)}>
        <Container className="items-center gap-0 flex-row">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <Container key={stepNumber} className="items-center flex-row">
                <Container
                  className={cn(
                    'items-center justify-center w-8 h-8 rounded-full font-bold transition-all duration-500 ease-in-out transform',
                    isActive ? 'bg-foreground text-background' : 'border text-muted-foreground',
                    isCompleted && 'bg-brand text-black border-brand',
                  )}
                >
                  <Container
                    className={cn(
                      'transition-all duration-500 ease-in-out flex items-center justify-center',
                      isCompleted ? 'animate-in fade-in zoom-in duration-500' : '',
                    )}
                  >
                    {isCompleted ? <Check size={16} /> : stepNumber}
                  </Container>
                </Container>
                {stepNumber < totalSteps && (
                  <Container className="relative w-24 xl:w-42 h-px overflow-hidden">
                    {/* Base line (gray) */}
                    <Container className="absolute inset-0 bg-border opacity-50" />

                    {/* Animated line (white) */}
                    <Container
                      className={cn(
                        'absolute inset-0 bg-brand transform transition-all duration-500 ease-out',
                        stepNumber < currentStep ? 'translate-x-0' : '-translate-x-full',
                      )}
                    />
                  </Container>
                )}
              </Container>
            );
          })}
        </Container>
      </Container>

      {/* Progress Steps - Mobile */}
      <Container className={cn('lg:hidden items-center gap-0 mt-2.5 flex-1 flex-row', className)}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isFirst = stepNumber === 1;
          const isLast = stepNumber === totalSteps;

          return (
            <Container
              key={stepNumber}
              className={cn(
                'relative w-8 h-4 bg-border overflow-hidden flex items-center justify-center flex-1',
                isFirst && 'rounded-l-full',
                isLast && 'rounded-r-full',
              )}
            >
              {/* Growing fill bar */}
              <Container
                className={cn(
                  'absolute inset-0 bg-foreground transition-transform duration-800 ease-out origin-left',
                  isActive || isCompleted ? 'scale-x-100' : 'scale-x-0',
                )}
                style={{
                  transitionDelay: isActive || isCompleted ? `${stepNumber * 150}ms` : '0ms',
                }}
              />
            </Container>
          );
        })}
      </Container>
    </>
  );
}
