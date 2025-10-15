'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';

interface PostProps {
  postId: string;
  clickable?: boolean;
  isReply?: boolean;
  onClick?: () => void;
}

export function SinglePost({ postId, clickable = false, isReply = false, onClick }: PostProps) {
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  return (
    <div className="relative">
      {isReply && (
        <div className="absolute -left-12 top-0">
          <Atoms.ReplyLine height={postHeight} />
        </div>
      )}
      <Atoms.Card
        ref={cardRef}
        className={`p-6 rounded-lg ${clickable ? 'cursor-pointer' : ''}`}
        onClick={clickable ? onClick : undefined}
      >
        <Atoms.Container className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Atoms.Container className="flex flex-col lg:col-span-2 gap-4">
            <div onClick={(e) => e.stopPropagation()}>
              <Organisms.SinglePostUserDetails postId={postId} />
            </div>

            <Atoms.Container className="flex flex-col gap-4">
              <Organisms.SinglePostContent postId={postId} />

              {/* Tags on mobile - between content and buttons */}
              <Atoms.Container className="block lg:hidden">
                <Organisms.SinglePostTags postId={postId} />
              </Atoms.Container>

              <div onClick={(e) => e.stopPropagation()}>
                <Organisms.SinglePostCounts postId={postId} />
              </div>
            </Atoms.Container>
          </Atoms.Container>

          {/* Tags on desktop - right column */}
          <Atoms.Container className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
            <Organisms.SinglePostTags postId={postId} />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>
    </div>
  );
}
