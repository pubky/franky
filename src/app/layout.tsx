import { Inter_Tight } from 'next/font/google';
import { DatabaseProvider } from '@/providers';

import './globals.css';

import * as Organisms from '@/organisms';
import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootContainer>
      <DatabaseProvider>
        <Molecules.Metadata />
        <Organisms.Header />
        {children}
        <Molecules.Toaster />
      </DatabaseProvider>
    </RootContainer>
  );
}

export function RootContainer({ children }: { children: React.ReactNode }) {
  return (
    <Atoms.Container as="html" lang="en" className="dark">
      <Atoms.Container as="body" className={`${interTight.variable} antialiased`}>
        <Molecules.PageContainer>{children}</Molecules.PageContainer>
      </Atoms.Container>
    </Atoms.Container>
  );
}
