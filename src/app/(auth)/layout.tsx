'use client';

import { OnboardingHeader, Footer, MainLayout } from '@/components/layout';
import { SessionGuard } from '@/components/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <OnboardingHeader />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </SessionGuard>
  );
}
