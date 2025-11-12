'use client';

import * as React from 'react';
import * as Libs from '@/libs';

export interface SettingsSwitchGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsSwitchGroup({ children, className }: SettingsSwitchGroupProps) {
  return (
    <div
      className={Libs.cn(
        'inline-flex w-full flex-col items-start justify-start gap-6 rounded-2xl bg-white/5 p-6 shadow-[0px_20px_40px_0px_rgba(5,5,10,0.50)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
