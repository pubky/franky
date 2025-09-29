import './globals.css';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Providers from '@/providers';

export const metadata = Molecules.Metadata({
  title: 'Pubky App - Unlock the web',
  description:
    'Pubky App is a social-media-like experience built over Pubky Core. It serves as a working example on how to build over Pubky Core to create simple or complex applications.',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Molecules.RootContainer>
      <Providers.DatabaseProvider>
        <Providers.RouteGuardProvider>
          <Organisms.Header />
          {children}
          <Molecules.Toaster />
        </Providers.RouteGuardProvider>
      </Providers.DatabaseProvider>
    </Molecules.RootContainer>
  );
}
