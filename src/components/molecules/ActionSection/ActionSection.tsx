import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

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
    <Atoms.Container className={Libs.cn('gap-6 w-full flex-row', className)}>
      <Atoms.Container className="flex-col items-start gap-3 justify-start w-full">{children}</Atoms.Container>
      {actions.length > 0 && (
        <Atoms.Container className="flex-row gap-3">
          {actions.map((action, index) => (
            <Atoms.Button
              key={index}
              variant={action.variant || 'secondary'}
              className="rounded-full"
              onClick={action.onClick}
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
