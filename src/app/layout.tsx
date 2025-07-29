import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import { DatabaseProvider } from '@/providers';

import './globals.css';
import { Toaster } from '@/components/ui';

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
          <div className="max-w-screen-xl mx-auto min-h-screen">{children}</div>
          <Toaster />
        </DatabaseProvider>
      </body>
    </html>
  );
}
