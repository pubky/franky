'use client';

import * as React from 'react';
import * as Libs from '@/libs';

export interface SettingsSwitchGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsSwitchGroup({ children, className }: SettingsSwitchGroupProps) {
  return <div className={Libs.cn('flex w-full flex-col items-start justify-start gap-6', className)}>{children}</div>;
}
