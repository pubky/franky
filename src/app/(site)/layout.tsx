import type { Metadata } from 'next';
import { Header, Footer, MainLayout } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Franky',
  description: "I'm ALIVEEE!",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MainLayout>{children}</MainLayout>
      <Footer />
    </>
  );
}
