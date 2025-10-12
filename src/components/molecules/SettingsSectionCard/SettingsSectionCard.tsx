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

export function SettingsSectionCard({ icon: Icon, title, description, children, className }: SettingsSectionCardProps) {
  return (
    <div
      className={Libs.cn(
        'p-8 md:p-12 bg-[#1D1D20] rounded-md flex-col justify-start items-start gap-12 inline-flex',
        className,
      )}
    >
      <div className="w-full flex-col justify-start items-start gap-3 flex">
        {Icon && title && (
          <div className="justify-start items-center gap-2 inline-flex">
            <Icon size={24} />
            <h2 className="text-2xl font-bold leading-8 text-foreground">{title}</h2>
          </div>
        )}
        {description && <p className="text-base font-medium leading-6 text-secondary-foreground">{description}</p>}
        {children}
      </div>
    </div>
  );
}
