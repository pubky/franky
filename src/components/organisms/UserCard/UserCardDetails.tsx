import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function UserCardDetails({ pubky }: { pubky: Core.Pubky }) {
  const userDetails = useLiveQuery(() => Core.db.user_details.get(pubky), [pubky]);

  return (
    <div className="flex items-center gap-3">
      <Atoms.Avatar className="w-12 h-12">
        {userDetails?.image ? (
          <Atoms.AvatarImage
            src={Libs.buildNexusStaticUrl(Core.FILES_API.GET_AVATAR(pubky))}
            alt={`${name}'s avatar`}
            loading="lazy"
          />
        ) : null}
        <Atoms.AvatarFallback>
          {userDetails?.name ? userDetails.name.slice(0, 2).toUpperCase() : pubky.slice(0, 2).toUpperCase()}
        </Atoms.AvatarFallback>
      </Atoms.Avatar>
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{userDetails?.name || 'Anonymous'}</span>
        <span className="text-xs text-muted-foreground">
          {pubky.slice(0, 6)}...{pubky.slice(-6)}
        </span>
      </div>
    </div>
  );
}
