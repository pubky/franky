import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { DatabaseProvider } from '@/providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Franky',
  description: "I'm ALIVEEE!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DatabaseProvider>{children}</DatabaseProvider>
      </body>
    </html>
  );
}
