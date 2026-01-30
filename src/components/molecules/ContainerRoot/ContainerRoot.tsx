import { Inter_Tight } from 'next/font/google';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import { isRtlLocale } from '@/i18n';

const interTight = Inter_Tight({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

interface RootContainerProps {
  children: React.ReactNode;
  locale?: string;
}

export function RootContainer({ children, locale = 'en' }: RootContainerProps) {
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <Atoms.Container as="html" lang={locale} dir={dir}>
      <Atoms.Container as="body" className={`${interTight.variable} antialiased`}>
        <Molecules.PageContainer>{children}</Molecules.PageContainer>
      </Atoms.Container>
    </Atoms.Container>
  );
}
