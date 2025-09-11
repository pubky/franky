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

export const metadata = Molecules.Metadata({
  title: 'Pubky App - Unlock the web',
  description:
    'Pubky App is a social-media-like experience built over Pubky Core. It serves as a working example on how to build over Pubky Core to create simple or complex applications.',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootContainer>
      <DatabaseProvider>
        <Organisms.Header />
        {children}
        <Molecules.Toaster />
      </DatabaseProvider>
    </RootContainer>
  );
}

function RootContainer({ children }: { children: React.ReactNode }) {
  return (
    <Atoms.Container as="html" lang="en" className="dark">
      <Atoms.Container as="body" className={`${interTight.variable} antialiased`}>
        <Molecules.PageContainer>{children}</Molecules.PageContainer>
      </Atoms.Container>
    </Atoms.Container>
  );
}
