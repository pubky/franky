'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Core from '@/core';

interface PostUserDetailsProps {
  postId: string;
}

export function PostUserDetails({ postId }: PostUserDetailsProps) {
  // TODO: Shall we do defensive parsing here or in the component that calls this?
  const {pubky: authorId} = Core.parsePostCompositeId(postId);
  const userDetails = useLiveQuery(() => Core.db.user_details.get(authorId).then((details) => details), [authorId]);
  const postDetails = useLiveQuery(() => Core.db.post_details.get(postId), [postId]);

  if (!userDetails || !postDetails) {
    return null;
  }

  const indexedAt = new Date(postDetails?.indexed_at || 0);

  return (
    <Atoms.Container className="flex items-center gap-3">
      <Atoms.Container className="flex flex-row gap-4">
        <Atoms.Avatar className="w-12 h-12">
          <Atoms.AvatarImage src={userDetails.image || undefined} />
          <Atoms.AvatarFallback>{Libs.extractInitials({ name: userDetails.name || '' }) || 'U'}</Atoms.AvatarFallback>
        </Atoms.Avatar>
        <Atoms.Container className="flex flex-col">
          <Atoms.Typography size="md" className="font-bold">
            {userDetails.name}
          </Atoms.Typography>
          <Atoms.Container className="flex flex-row gap-2">
            <Atoms.Typography size="sm" className="text-muted-foreground uppercase">
              {Libs.formatPublicKey({ key: userDetails.id, length: 8 })}
            </Atoms.Typography>
            <Atoms.Container className="flex flex-row gap-1 items-center">
              <Libs.Clock className="h-4 w-4 text-muted-foreground" />
              <Atoms.Typography size="sm" className="text-muted-foreground">
                {Libs.timeAgo(indexedAt)}
              </Atoms.Typography>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
