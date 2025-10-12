import * as React from 'react';

export interface SettingsDividerProps {
  className?: string;
}

export const SettingsDivider = React.memo(function SettingsDivider({ className }: SettingsDividerProps) {
  return <div className={className || 'w-full h-px bg-white/10 my-6'} aria-hidden="true" />;
});
