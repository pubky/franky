'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import * as Config from '@/config';

export const HumanFooter = () => {
  return (
    <Atoms.Container className={Libs.cn('flex-col gap-0 py-6')}>
      <Atoms.FooterLinks>
        By creating a <span className="text-brand">Pubky</span> account, you agree to the <Organisms.DialogTerms />,{' '}
        <Organisms.DialogPrivacy />, and confirm you are <Organisms.DialogAge />
      </Atoms.FooterLinks>
      <Atoms.FooterLinks>
        Pubky is powered by{' '}
        <Atoms.Link href={Config.PUBKY_CORE_URL} target="_blank">
          Pubky Core
        </Atoms.Link>{' '}
        and was built with love and dedication by Synonym Software, S.A. DE C.V. ©2025. All rights reserved.
      </Atoms.FooterLinks>
    </Atoms.Container>
  );
};
