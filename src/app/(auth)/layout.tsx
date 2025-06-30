import type { Metadata } from 'next';
import { OnboardingHeader, Footer, MainLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Franky',
  description: "I'm ALIVEEE!",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingHeader />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </>
  );
}
