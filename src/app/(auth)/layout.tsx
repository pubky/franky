'use client';

import { OnboardingHeader, Footer, MainLayout } from '@/components/layout';
import { SessionGuard } from '@/components/guards';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <OnboardingHeader />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </SessionGuard>
  );
}
