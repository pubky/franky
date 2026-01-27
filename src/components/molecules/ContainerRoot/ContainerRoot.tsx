import { Inter_Tight } from 'next/font/google';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

/** RTL (Right-to-Left) language codes */
const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

interface RootContainerProps {
  children: React.ReactNode;
  locale?: string;
}

export function RootContainer({ children, locale = 'en' }: RootContainerProps) {
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <Atoms.Container as="html" lang={locale} dir={dir}>
      <Atoms.Container as="body" className={`${interTight.variable} antialiased`}>
        <Molecules.PageContainer>{children}</Molecules.PageContainer>
      </Atoms.Container>
    </Atoms.Container>
  );
}
