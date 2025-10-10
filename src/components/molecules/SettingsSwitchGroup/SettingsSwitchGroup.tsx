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
        'w-full p-6 bg-white/5 shadow-[0px_20px_40px_0px_rgba(5,5,10,0.50)] rounded-2xl flex-col justify-start items-start gap-6 inline-flex',
        className,
      )}
    >
      {children}
    </div>
  );
}
