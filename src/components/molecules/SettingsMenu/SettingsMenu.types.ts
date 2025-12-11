import * as React from 'react';

export interface SettingsMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

export interface SettingsMenuProps {
  className?: string;
}
