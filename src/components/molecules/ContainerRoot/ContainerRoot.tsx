import { Inter_Tight } from 'next/font/google';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

interface RootContainerProps {
  children: React.ReactNode;
}

export function RootContainer({ children }: RootContainerProps) {
  return (
    <Atoms.Container as="html" lang="en">
      <Atoms.Container as="body" className={`${interTight.variable} antialiased`}>
        <Molecules.PageContainer>{children}</Molecules.PageContainer>
      </Atoms.Container>
    </Atoms.Container>
  );
}
