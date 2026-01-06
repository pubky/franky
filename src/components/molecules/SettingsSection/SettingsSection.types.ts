import * as React from 'react';

export interface SettingsSectionProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ComponentType<{ size?: number }>;
  buttonId: string;
  buttonVariant?: 'secondary' | 'destructive';
  buttonDisabled?: boolean;
  buttonOnClick: () => void;
  titleClassName?: string;
  iconClassName?: string;
}
