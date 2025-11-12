'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

interface MutedUser {
  id: string;
  name?: string;
}

export interface MutedUsersProps {
  className?: string;
}

export function MutedUsers({ className }: MutedUsersProps) {
  const [mutedUsers] = React.useState<MutedUser[]>([]);
  const [isLoading] = React.useState(false);

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.VolumeX}
      title="Muted users"
      description="Here is an overview of all users you muted. You can choose to unmute users if you want."
      className={className}
    >
      <div className="inline-flex w-full flex-col gap-3">
        {isLoading ? (
          <div className="w-full">
            <p className="text-base leading-6 font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : mutedUsers && mutedUsers.length > 0 ? (
          <>
            {mutedUsers.map((mutedUser) => (
              <div key={mutedUser?.id} className="w-full">
                <div className="inline-flex w-full flex-col justify-start gap-4 md:flex-row">
                  <div className="flex w-full gap-2">
                    <Atoms.Avatar className="h-12 w-12">
                      <Atoms.AvatarFallback>{mutedUser?.name?.[0] || 'U'}</Atoms.AvatarFallback>
                    </Atoms.Avatar>
                    <div className="inline-flex flex-col items-start justify-center">
                      <span className="text-base font-semibold">{mutedUser?.name || 'Unknown User'}</span>
                      <span className="text-sm text-muted-foreground">{mutedUser?.id || ''}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Atoms.Button id="unmute-btn" variant="secondary" size="default" onClick={() => {}}>
                      <Libs.VolumeX size={16} />
                      Unmute
                    </Atoms.Button>
                  </div>
                </div>
              </div>
            ))}
            {mutedUsers.length > 1 && (
              <>
                <Molecules.SettingsDivider className="my-6 h-px w-full bg-white/10" />
                <Atoms.Button variant="secondary" size="default" onClick={() => {}} className="w-[180px]">
                  <Libs.VolumeX size={16} />
                  Unmute all users
                </Atoms.Button>
              </>
            )}
          </>
        ) : (
          <h2 className="mt-5 flex self-center text-center text-2xl leading-8 font-normal opacity-20">
            No muted users yet
          </h2>
        )}
      </div>
    </Molecules.SettingsSectionCard>
  );
}
