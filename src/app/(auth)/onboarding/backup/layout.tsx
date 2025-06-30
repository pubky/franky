'use client';

import { ReactNode } from 'react';
import { KeysGuard } from '@/components/ui';

interface BackupLayoutProps {
  children: ReactNode;
}

export default function BackupLayout({ children }: BackupLayoutProps) {
  return <KeysGuard fallbackRoute="/onboarding">{children}</KeysGuard>;
}
