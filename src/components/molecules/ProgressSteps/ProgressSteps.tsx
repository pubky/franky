import { Check } from 'lucide-react';

import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressSteps({ currentStep, totalSteps, className }: ProgressStepsProps) {
  return (
    <>
      {/* Progress Steps - Desktop */}
      <Atoms.Container className={Libs.cn('hidden lg:flex items-center gap-4 mt-1 flex-1', className)}>
        <Atoms.Container className="items-center gap-0 flex-row">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <Atoms.Container key={stepNumber} className="items-center flex-row">
                <Atoms.Container
                  className={Libs.cn(
                    'items-center justify-center w-8 h-8 rounded-full font-bold transition-all duration-500 ease-in-out transform',
                    isActive ? 'bg-foreground text-background' : 'border text-muted-foreground',
                    isCompleted && 'bg-transparent text-brand border-brand',
                  )}
                >
                  <Atoms.Container
                    className={Libs.cn(
                      'transition-all duration-500 ease-in-out flex items-center justify-center',
                      isCompleted ? 'animate-in fade-in zoom-in duration-500' : '',
                    )}
                  >
                    {isCompleted ? <Check size={16} /> : stepNumber}
                  </Atoms.Container>
                </Atoms.Container>
                {stepNumber < totalSteps && (
                  <Atoms.Container className="relative w-24 xl:w-44 h-px overflow-hidden">
                    {/* Base line (gray) */}
                    <Atoms.Container className="absolute inset-0 bg-border opacity-50" />

                    {/* Animated line (white) */}
                    <Atoms.Container
                      className={Libs.cn(
                        'absolute inset-0 bg-brand transform transition-all duration-500 ease-out',
                        stepNumber < currentStep ? 'translate-x-0' : '-translate-x-full',
                      )}
                    />
                  </Atoms.Container>
                )}
              </Atoms.Container>
            );
          })}
        </Atoms.Container>
      </Atoms.Container>

      {/* Progress Steps - Mobile */}
      <Atoms.Container
        className={Libs.cn('lg:hidden items-center gap-0 mt-2.5 max-w-xs mr-0 flex-1 flex-row', className)}
      >
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isFirst = stepNumber === 1;
          const isLast = stepNumber === totalSteps;

          return (
            <Atoms.Container
              key={stepNumber}
              className={Libs.cn(
                'relative w-8 h-4 bg-border overflow-hidden flex items-center justify-center flex-1',
                isFirst && 'rounded-l-full',
                isLast && 'rounded-r-full',
              )}
            >
              {/* Growing fill bar */}
              <Atoms.Container
                className={Libs.cn(
                  'absolute inset-0 bg-foreground transition-transform duration-800 ease-out origin-left',
                  isActive || isCompleted ? 'scale-x-100' : 'scale-x-0',
                )}
                style={{
                  transitionDelay: isActive || isCompleted ? `${stepNumber * 150}ms` : '0ms',
                }}
              />
            </Atoms.Container>
          );
        })}
      </Atoms.Container>
    </>
  );
}
