'use client';

import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as App from '@/app';

export const HomeActions = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push(App.ONBOARDING_ROUTES.HUMAN);
  };

  const handleSignIn = () => {
    router.push(App.AUTH_ROUTES.SIGN_IN);
  };

  return <Molecules.ActionButtons onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />;
};

export const HomeFooter = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Atoms.Container
      className={Libs.cn('flex-1 flex-col items-start justify-end gap-1 pt-3 sm:pr-12', props.className)}
      {...props}
    >
      <Atoms.Container className="flex-row items-center gap-1">
        <Atoms.Link href="https://synonym.to" target="_blank" className="block">
          <Atoms.Image src="/images/synonym-grey-logo.svg" alt="Synonym" width={95} height={24} />
        </Atoms.Link>
        <Atoms.Container className="flex-row items-center gap-1">
          <Atoms.Typography as="span" size="sm" className="font-normal text-muted-foreground">
            a
          </Atoms.Typography>
          <Atoms.Image src="/images/tether-text.svg" alt="Tether" width={40} height={9} />
          <Atoms.Typography as="span" size="sm" className="font-normal text-muted-foreground">
            company
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.Container>
      <Atoms.Typography as="span" size="sm" className="font-normal text-muted-foreground">
        Synonym Software, S.A. DE C.V. ©2026. All rights reserved.
      </Atoms.Typography>
    </Atoms.Container>
  );
};

export const HomeSectionTitle = () => {
  return (
    <Atoms.Container className="flex-row items-start gap-2">
      <Atoms.Typography size="md" className="self-center font-light text-brand sm:text-2xl">
        Your keys, your content, your rules.
      </Atoms.Typography>
    </Atoms.Container>
  );
};

export const HomePageHeading = () => {
  return (
    <Atoms.Heading level={1} size="2xl">
      <span className="text-brand">Unlock</span> <br className="block sm:hidden" />
      the web.
    </Atoms.Heading>
  );
};
