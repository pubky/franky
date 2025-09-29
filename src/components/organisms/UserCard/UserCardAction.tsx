import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function UserCardAction({ pubky }: { pubky: Core.Pubky }) {
  const userRelationship = useLiveQuery(() => Core.db.user_relationships.get(pubky), [pubky]);
  const profileSection = Core.useProfileStore((state) => state.selectSection());

  let following = false;

  switch (profileSection) {
    case Core.ProfileSection.FOLLOWERS:
      if (userRelationship?.followed_by) {
        following = true;
      }
      break;
    case Core.ProfileSection.FOLLOWING:
      if (userRelationship?.following) {
        following = true;
      }
      break;
    case Core.ProfileSection.FRIENDS:
      return true;
    default:
      return null;
  }

  //TODO: missing action onClick. Mutate indexdb and PUT homeserver
  return (
    <Atoms.Button variant="ghost" size="sm">
      {following ? <Libs.UserPlus className="w-4 h-4" /> : <Libs.Check className="w-4 h-4" />}
    </Atoms.Button>
  );
}
