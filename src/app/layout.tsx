import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import { DatabaseProvider } from '@/providers';
import { Header, Footer, MainLayout } from '@/components/layout';

import './globals.css';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Franky',
  description: "I'm ALIVEEE!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${interTight.variable} antialiased`}>
        <DatabaseProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <MainLayout>{children}</MainLayout>
            <Footer />
          </div>
        </DatabaseProvider>
      </body>
    </html>
  );
}
