import type { Metadata } from 'next';
import { Inter_Tight } from 'next/font/google';
import { DatabaseProvider } from '@/providers';

import './globals.css';
import { Container, Toaster } from '@/components/ui';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pubky App',
  description: 'Pubky App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container as="html" lang="en" className="dark">
      <Container as="body" className={`${interTight.variable} antialiased`}>
        <DatabaseProvider>
          <Container size="xl" className="min-h-screen">
            {children}
          </Container>
          <Toaster />
        </DatabaseProvider>
      </Container>
    </Container>
  );
}
