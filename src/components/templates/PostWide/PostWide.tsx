'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Organisms from '@/organisms';

interface PostWideProps {
  postId: string;
  clickable?: boolean;
  isReply?: boolean;
  onClick?: () => void;
}

export function PostWide({ postId, clickable = false, isReply = false, onClick }: PostWideProps) {
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  return (
    <div className="relative">
      {isReply && (
        <div className="absolute -left-12 top-0">
          <Atoms.ReplyLine postHeight={postHeight} />
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
              <Organisms.PostUserDetails postId={postId} />
            </div>

            <Atoms.Container className="flex flex-col gap-4">
              <Organisms.PostContent postId={postId} />

              {/* Tags on mobile - between content and buttons */}
              <Atoms.Container className="block lg:hidden">
                <Organisms.PostTags postId={postId} />
              </Atoms.Container>

              <div onClick={(e) => e.stopPropagation()}>
                <Organisms.PostCounts postId={postId} />
              </div>
            </Atoms.Container>
          </Atoms.Container>

          {/* Tags on desktop - right column */}
          <Atoms.Container className="hidden lg:block" onClick={(e) => e.stopPropagation()}>
            <Organisms.PostTags postId={postId} />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>
    </div>
  );
}
