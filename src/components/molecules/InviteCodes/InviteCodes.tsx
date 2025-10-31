'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export interface InviteCodesProps {
  inviteCodes?: string[];
  className?: string;
}

export function InviteCodes({ inviteCodes = [], className }: InviteCodesProps) {
  const defaultInviteCodes = ['K8M5-3X9S-27PS', 'X4RS-3G1K-56HS', '9PUM-2JNG-37ER'];
  const codes = inviteCodes.length > 0 ? inviteCodes : defaultInviteCodes;
  const { copyToClipboard } = Hooks.useCopyToClipboard({
    successTitle: 'Invite code copied to clipboard',
  });

  const handleCodeClick = (code: string) => {
    void copyToClipboard(code);
  };

  return (
    <div className={Libs.cn('flex flex-col gap-2 w-full', className)} data-testid="invite-codes">
      <Atoms.Heading level={5} size="lg" weight="light" className="text-muted-foreground">
        Invite codes
      </Atoms.Heading>
      <Atoms.Typography size="base" className="text-secondary-foreground">
        Use these codes to invite your friends to Pubky!
      </Atoms.Typography>
      <div className="flex flex-col gap-2" data-testid="invite-codes-list">
        {codes.map((code, index) => (
          <Atoms.Badge
            key={code}
            variant="brand"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCodeClick(code)}
            data-testid={`invite-code-${index}`}
          >
            {code}
          </Atoms.Badge>
        ))}
      </div>
    </div>
  );
}
