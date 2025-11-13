import * as React from 'react';

export interface SettingsDividerProps {
  className?: string;
}

export const SettingsDivider = React.memo(function SettingsDivider({ className }: SettingsDividerProps) {
  return <div className={className || 'my-6 h-px w-full bg-white/10'} aria-hidden="true" />;
});
