'use client';

import { useRouter } from 'next/navigation';

import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as App from '@/app';

export const HomeActions = () => {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push(App.ONBOARDING_ROUTES.INSTALL);
  };

  const handleSignIn = () => {
    router.push(App.AUTH_ROUTES.SIGN_IN);
  };

  return <Molecules.ActionButtons onSignIn={handleSignIn} onCreateAccount={handleCreateAccount} />;
};

export const HomeFooter = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Atoms.FooterLinks className={Libs.cn('sm:pr-16 justify-end flex-row content-end', props.className)} {...props}>
      By creating a Pubky account, you agree to the <Organisms.DialogTerms />, <Organisms.DialogPrivacy />, and confirm
      you are <Organisms.DialogAge /> Pubky is powered by{' '}
      <Atoms.Link href={Config.PUBKY_CORE_URL} target="_blank">
        Pubky Core
      </Atoms.Link>{' '}
      and was built with love and dedication by Synonym Software Ltd. ©2025.
    </Atoms.FooterLinks>
  );
};

export const HomeSectionTitle = () => {
  return (
    <Atoms.Container className="flex-row items-start gap-2">
      <Atoms.Typography size="md" className="text-brand font-light sm:text-2xl self-center">
        Pubky requires an invite code
      </Atoms.Typography>
      <Molecules.PopoverInvite />
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
