'use client';

import * as Atoms from '@/atoms';
import * as Hooks from '@/hooks';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';

interface PostWideProps {
  postId: string;
  clickable?: boolean;
  showReplyConnector?: boolean;
}

export function PostWide({ postId, clickable = false, showReplyConnector = false }: PostWideProps) {
  const { ref: cardRef, height: postHeight } = Hooks.useElementHeight();

  const { path, tailPath, width, height } = showReplyConnector
    ? Libs.createReplyConnectorPath(postHeight)
    : { path: '', tailPath: null, width: 0, height: 0 };

  return (
    <div className="relative">
      {showReplyConnector && (
        <div className="absolute -left-12 top-0">
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet">
            <path
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {tailPath && (
              <path
                d={tailPath}
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
        </div>
      )}
      <Atoms.Card
        ref={cardRef}
        className={`p-6 rounded-lg ${clickable ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
      >
        <Atoms.Container className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Atoms.Container className="flex flex-col lg:col-span-2 gap-4">
            <Organisms.PostUserDetails postId={postId} />

            <Atoms.Container className="flex flex-col gap-4">
              <Organisms.PostContent postId={postId} />

              {/* Tags on mobile - between content and buttons */}
              <Atoms.Container className="block lg:hidden">
                <Organisms.PostTags postId={postId} />
              </Atoms.Container>

              <Organisms.PostCounts postId={postId} />
            </Atoms.Container>
          </Atoms.Container>

          {/* Tags on desktop - right column */}
          <Atoms.Container className="hidden lg:block">
            <Organisms.PostTags postId={postId} />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Card>
    </div>
  );
}
