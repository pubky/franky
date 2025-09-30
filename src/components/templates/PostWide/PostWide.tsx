'use client';

import { useRef, useEffect, useState } from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

interface PostWideProps {
  postId: string;
  clickable?: boolean;
  showReplyConnector?: boolean;
  isLast?: boolean;
}

export function PostWide({ postId, clickable = false, showReplyConnector = false, isLast = false }: PostWideProps) {
  const [postHeight, setPostHeight] = useState(100);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showReplyConnector || !cardRef.current) return;

    const updateHeight = () => {
      if (cardRef.current) {
        const height = cardRef.current.getBoundingClientRect().height;
        setPostHeight(height);
      }
    };

    // Initial height
    updateHeight();

    // Use ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(cardRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [showReplyConnector]);

  const { path, tailPath, width, height } = createReplyConnectorPath(postHeight, isLast);

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

function createReplyConnectorPath(postHeight: number, isLast: boolean = false) {
  const x = 16;
  const y = 0;
  const safePostHeight = Math.max(postHeight || 100, 100);
  const H = safePostHeight / 2;
  const W = 24;
  const R = 8;
  const gapSpacing = 16; // gap-4 = 16px

  const validH = Math.max(H, R);
  const path = `M ${x} ${y} v ${validH - R} a ${R} ${R} 0 0 0 ${R} ${R} h ${W}`;

  const hasTail = !isLast;
  const tailHeight = hasTail ? safePostHeight / 2 - R + gapSpacing : 0;
  const vbW = x + R + W;
  const vbH = validH + R + tailHeight;

  return {
    path,
    tailPath: hasTail ? `M ${x} ${validH + R} v ${tailHeight}` : null,
    width: vbW,
    height: vbH,
  };
}
