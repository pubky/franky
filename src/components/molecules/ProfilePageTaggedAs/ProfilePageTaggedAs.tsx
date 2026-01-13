'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import { useRouter } from 'next/navigation';
import { PROFILE_ROUTES, getProfileRoute } from '@/app/routes';
import type { ProfilePageTaggedAsProps } from './ProfilePageTaggedAs.types';
import { MAX_NAME_LENGTH } from './ProfilePageTaggedAs.constants';

export function ProfilePageTaggedAs({
  tags,
  isLoading = false,
  onTagClick,
  pubky,
  userName,
}: ProfilePageTaggedAsProps) {
  const router = useRouter();
  const { requireAuth } = Hooks.useRequireAuth();

  const getButtonLabel = () => {
    if (!pubky) return 'Tag Yourself';
    if (userName) return `Tag ${Libs.truncateString(userName, MAX_NAME_LENGTH)}`;
    return 'Tag User';
  };

  // Handle button click - require auth for unauthenticated users
  const handleButtonClick = () => {
    requireAuth(() => router.push(getProfileRoute(PROFILE_ROUTES.UNIQUE_TAGS, pubky)));
  };

  return (
    <Atoms.Container overrideDefaults={true} className="flex flex-col gap-2">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Tagged as
      </Atoms.Heading>

      <Atoms.Container overrideDefaults={true} className="flex flex-col gap-2">
        {isLoading ? (
          <Atoms.Container overrideDefaults={true} className="flex items-center gap-2">
            <Atoms.Spinner size="sm" />
            <Atoms.Typography as="span" className="text-sm font-medium text-muted-foreground">
              Loading tags...
            </Atoms.Typography>
          </Atoms.Container>
        ) : (
          <>
            {tags.map((tag) => (
              <Molecules.TaggedItem key={tag.label} tag={tag} onTagClick={onTagClick} maxTagLength={10} hideAvatars />
            ))}
            {tags.length === 0 && (
              <Atoms.Typography as="span" className="text-sm font-medium text-muted-foreground">
                No tags added yet.
              </Atoms.Typography>
            )}
          </>
        )}
      </Atoms.Container>

      <Atoms.Button
        variant="outline"
        size="sm"
        className="border border-border bg-foreground/5"
        onClick={handleButtonClick}
      >
        <Libs.Tag size={16} className="text-foreground" />
        <Atoms.Typography as="span" className="text-sm font-bold">
          {getButtonLabel()}
        </Atoms.Typography>
      </Atoms.Button>
    </Atoms.Container>
  );
}
