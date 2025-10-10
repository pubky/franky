'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  'data-testid'?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  'data-testid': dataTestId,
}: EmptyStateProps) {
  return (
    <Atoms.Card
      className={Libs.cn('p-12 flex flex-col items-center justify-center text-center gap-4', className)}
      data-testid={dataTestId || 'empty-state'}
    >
      {Icon && (
        <div className="rounded-full bg-muted p-6">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Atoms.Heading level={3} size="lg">
          {title}
        </Atoms.Heading>
        {description && (
          <Atoms.Typography size="md" className="text-muted-foreground max-w-md">
            {description}
          </Atoms.Typography>
        )}
      </div>

      {action && (
        <Atoms.Button onClick={action.onClick} variant="default" size="default">
          {action.label}
        </Atoms.Button>
      )}
    </Atoms.Card>
  );
}
