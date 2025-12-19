'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';
import type { PostPreviewCardProps } from './PostPreviewCard.types';

/**
 * PostPreviewCard - Compact preview card for displaying a post in a nested context.
 *
 * **Purpose:**
 * Renders a compact, read-only preview of a post within another post's context.
 * Used primarily for displaying the original post when viewing a repost or reply.
 *
 * **Key Design Decision:**
 * Uses PostContentBase instead of PostContent to prevent infinite repost nesting.
 * If PostContent were used, it would detect the nested post as a repost and render
 * another PostPreviewCard, creating an infinite loop.
 *
 * **Usage:**
 * - Repost previews: Shows the original post being reposted (in PostContent)
 * - Reply previews: Shows the post being replied to (in DialogReply)
 * - Any nested context where a compact post preview is needed
 */
export function PostPreviewCard({ postId, className }: PostPreviewCardProps) {
  return (
    <Atoms.Card className={Libs.cn('rounded-md py-0', className)}>
      <Atoms.CardContent className="flex flex-col gap-4 p-6">
        <Organisms.PostHeader postId={postId} />
        <Organisms.PostContentBase postId={postId} />
      </Atoms.CardContent>
    </Atoms.Card>
  );
}
