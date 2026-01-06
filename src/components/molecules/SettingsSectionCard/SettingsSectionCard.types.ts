import * as React from 'react';

export interface SettingsSectionCardProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
