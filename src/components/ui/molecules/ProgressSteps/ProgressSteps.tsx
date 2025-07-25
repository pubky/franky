'use client';

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
        <div className="flex items-center gap-4">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full font-bold',
                    isActive || isCompleted ? 'bg-foreground text-background' : 'border text-muted-foreground',
                  )}
                >
                  {stepNumber}
                </div>
                {stepNumber < totalSteps && <div className="w-16 xl:w-32 h-px bg-border ml-4" />}
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
                'w-8 h-4',
                isActive || isCompleted ? 'bg-foreground' : 'bg-border',
                isFirst && 'rounded-l-full',
                isLast && 'rounded-r-full',
              )}
            />
          );
        })}
      </div>
    </>
  );
}
