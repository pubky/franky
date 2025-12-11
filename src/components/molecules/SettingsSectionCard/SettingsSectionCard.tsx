'use client';

import * as React from 'react';
import * as Libs from '@/libs';

export interface SettingsSectionCardProps {
  icon?: React.ComponentType<{ size?: number }>;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: SettingsSectionCardProps): React.ReactElement {
  return (
    <div
      className={Libs.cn(
        'inline-flex flex-col items-start justify-start gap-12 rounded-md bg-[#1D1D20] p-8 md:p-12',
        className,
      )}
    >
      <div className="flex w-full flex-col items-start justify-start gap-3">
        {Icon && title && (
          <div className="inline-flex items-center justify-start gap-2">
            <Icon size={24} />
            <h2 className="text-2xl leading-8 font-bold text-foreground">{title}</h2>
          </div>
        )}
        {description && <p className="text-base leading-6 font-medium text-secondary-foreground">{description}</p>}
        {children}
      </div>
    </div>
  );
}
