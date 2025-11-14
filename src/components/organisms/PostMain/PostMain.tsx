'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export interface PostMainProps {
  postId: string;
  onClick?: () => void;
  className?: string;
  isReply?: boolean;
  isLastReply?: boolean;
}

export function PostMain({ postId, onClick, className, isReply = true, isLastReply = false }: PostMainProps) {
  // Get post height for thread connector
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  // Fetch post tags
  const postTags = useLiveQuery(async () => {
    return await Core.PostTagsModel.findById(postId);
  }, [postId]);

  const tags =
    postTags?.tags.map((tag, index) => ({
      id: `${postId}-tag-${index}`,
      label: tag.label,
    })) || [];

  // Determine thread connector variant based on reply status
  const connectorVariant = isLastReply ? 'last' : 'regular';

  return (
    <Atoms.Container overrideDefaults onClick={onClick} className="relative flex cursor-pointer">
      {isReply && (
        <Atoms.Container overrideDefaults className="w-3 flex-shrink-0">
          <Atoms.PostThreadConnector height={postHeight} variant={connectorVariant} />
        </Atoms.Container>
      )}
      <Atoms.Card ref={cardRef} className={Libs.cn('flex-1 rounded-md py-0', className)}>
        <Atoms.CardContent className="flex flex-col gap-4 p-6">
          <Organisms.PostHeader postId={postId} />
          <Organisms.PostContent postId={postId} />
          <Atoms.Container overrideDefaults className="flex flex-col justify-between gap-2 md:flex-row md:gap-0">
            <Molecules.PostTagsList
              tags={tags}
              showInput={false}
              showAddButton={false}
              addMode
              showEmojiPicker={false}
              showTagClose={false}
            />
            <Organisms.PostActionsBar postId={postId} />
          </Atoms.Container>
        </Atoms.CardContent>
      </Atoms.Card>
    </Atoms.Container>
  );
}
