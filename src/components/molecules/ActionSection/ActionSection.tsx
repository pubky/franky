import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ActionSectionProps {
  children?: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  actions?: Array<{
    id?: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'brand';
    disabled?: boolean;
    className?: React.HTMLAttributes<HTMLButtonElement>['className'];
  }>;
}

export function ActionSection({ children, className, actions = [] }: ActionSectionProps) {
  return (
    <Atoms.Container className={Libs.cn('gap-6 w-full flex-row', className)}>
      <Atoms.Container className="flex-col items-start gap-4 justify-start w-full">{children}</Atoms.Container>
      {actions.length > 0 && (
        <Atoms.Container className="flex-row gap-3">
          {actions.map((action, index) => (
            <Atoms.Button
              id={action.id}
              key={index}
              variant={action.variant || 'secondary'}
              className={Libs.cn('rounded-full', action.className)}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
              {action.label}
            </Atoms.Button>
          ))}
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
