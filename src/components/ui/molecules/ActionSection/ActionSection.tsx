import { ReactNode } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/libs';

interface ActionSectionProps {
  children?: ReactNode;
  className?: string;
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'brand';
  }>;
}

export function ActionSection({ children, className, actions = [] }: ActionSectionProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {children}
      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'secondary'}
              className="rounded-full"
              onClick={action.onClick}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
