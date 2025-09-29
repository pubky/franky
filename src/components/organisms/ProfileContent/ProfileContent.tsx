'use client';

import * as Templates from '@/templates';
import * as Core from '@/core';
import * as Organisms from '@/organisms';

export function ProfileContent({ pubkySlug }: Templates.TProfilePageProps) {
  const profileSection = Core.useProfileStore((state) => state.selectSection());

  if (profileSection === Core.ProfileSection.NOTIFICATIONS) {
    return <main className="flex-1 min-w-0">Notifications</main>;
  }

  if (profileSection === Core.ProfileSection.POSTS) {
    return <main className="flex-1 min-w-0">Posts</main>;
  }

  if (profileSection === Core.ProfileSection.REPLIES) {
    return <main className="flex-1 min-w-0">Replies</main>;
  }

  if (profileSection === Core.ProfileSection.FOLLOWERS) {
    return <Organisms.UserRelationshipList pubky={pubkySlug} relationshipType={Core.RelationshipType.FOLLOWERS} />;
  }

  if (profileSection === Core.ProfileSection.FOLLOWING) {
    return <Organisms.UserRelationshipList pubky={pubkySlug} relationshipType={Core.RelationshipType.FOLLOWING} />;
  }

  if (profileSection === Core.ProfileSection.FRIENDS) {
    return <Organisms.UserRelationshipList pubky={pubkySlug} relationshipType={Core.RelationshipType.FRIENDS} />;
  }

  if (profileSection === Core.ProfileSection.TAGGED) {
    return <main className="flex-1 min-w-0">Tagged</main>;
  }
}
