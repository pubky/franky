import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Stepper - Compact View */}
      <div className="block md:hidden">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-xs text-muted-foreground">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-right">
            <p className="text-xs font-semibold text-foreground">{steps[currentStep - 1]?.title}</p>
          </div>
        </div>
      </div>

      {/* Desktop Stepper - Full View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                {/* Step Circle and Label - Inline */}
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200
                      ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-green-500 text-white ring-2 ring-green-500/20'
                            : 'bg-muted text-muted-foreground border-2 border-muted'
                      }
                    `}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : stepNumber}
                  </div>

                  {/* Step Labels */}
                  <p
                    className={`
                      text-sm font-medium transition-colors duration-200 whitespace-nowrap
                      ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                    `}
                  >
                    {step.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-3">
                    <div
                      className={`
                        h-0.5 w-full transition-colors duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-muted'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
