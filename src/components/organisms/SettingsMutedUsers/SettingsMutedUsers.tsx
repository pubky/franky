'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

interface MutedUser {
  id: string;
  name?: string;
}

export interface SettingsMutedUsersProps {
  className?: string;
}

export function SettingsMutedUsers({ className }: SettingsMutedUsersProps) {
  const [mutedUsers] = React.useState<MutedUser[]>([]);
  const [isLoading] = React.useState(false);

  return (
    <Molecules.SettingsSectionCard
      icon={Libs.VolumeX}
      title="Muted users"
      description="Here is an overview of all users you muted. You can choose to unmute users if you want."
      className={className}
    >
      <div className="w-full flex-col inline-flex gap-3">
        {isLoading ? (
          <div className="w-full">
            <p className="text-base font-medium leading-6 text-muted-foreground">Loading...</p>
          </div>
        ) : mutedUsers && mutedUsers.length > 0 ? (
          <>
            {mutedUsers.map((mutedUser) => (
              <div key={mutedUser?.id} className="w-full">
                <div className="flex-col md:flex-row justify-start gap-4 inline-flex w-full">
                  <div className="flex gap-2 w-full">
                    <Atoms.Avatar className="w-12 h-12">
                      <Atoms.AvatarFallback>{mutedUser?.name?.[0] || 'U'}</Atoms.AvatarFallback>
                    </Atoms.Avatar>
                    <div className="flex-col justify-center items-start inline-flex">
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
                <div className="w-full h-px bg-white/10 my-6" />
                <Atoms.Button variant="secondary" size="default" onClick={() => {}} className="w-[180px]">
                  <Libs.VolumeX size={16} />
                  Unmute all users
                </Atoms.Button>
              </>
            )}
          </>
        ) : (
          <h2 className="text-2xl font-normal leading-8 opacity-20 text-center flex self-center mt-5">
            No muted users yet
          </h2>
        )}
      </div>
    </Molecules.SettingsSectionCard>
  );
}
