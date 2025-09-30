'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Templates from '@/templates';
import * as Organisms from '@/organisms';

interface PostPageParams {
  params: Promise<{
    profileId: Core.Pubky;
    postId: string;
  }>;
}

export default function PostPage({ params }: PostPageParams) {
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ postId: resolvedPostId }) => {
      setPostId(resolvedPostId);
    });
  }, [params]);

  const postData = useLiveQuery(
    () => {
      if (!postId) return Promise.resolve(null);

      return Promise.all([
        Core.db.post_details.get(postId),
        Core.db.post_counts.get(postId),
        Core.db.post_tags.get(postId),
        Core.db.post_relationships.get(postId),
        Core.db.post_relationships.where('replied').equals(postId).count(),
      ]).then(([details, counts, tags, relationships, replyCount]) => {
        if (!details) return null;

        const baseCounts = counts || {
          id: details.id,
          tags: 0,
          unique_tags: 0,
          replies: 0,
          reposts: 0,
        };

        const post: Core.NexusPost = {
          details: {
            id: details.id,
            content: details.content,
            indexed_at: details.indexed_at,
            author: details.author,
            kind: details.kind,
            uri: details.uri,
            attachments: details.attachments,
          },
          counts: {
            ...baseCounts,
            replies: replyCount,
          },
          tags: tags?.tags.map((t) => new Core.TagModel(t)) || [],
          relationships: relationships || {
            id: details.id,
            replied: null,
            reposted: null,
            mentioned: [],
          },
          bookmark: null,
        };

        return post;
      });
    },
    [postId],
    null,
  );

  if (!postData) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-muted-foreground">
          Loading post...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Atoms.Typography>Post by {postData.details.author}</Atoms.Typography>
        <Templates.PostWide post={postData} />
      </Atoms.Container>

      {postId && (
        <Atoms.Container size="container" className="px-6 pb-8 mt-4">
          <Atoms.Container className="flex flex-col gap-4">
            <Organisms.PostReplies postId={postId} />
            <Organisms.PostReplyInput postId={postId} />
          </Atoms.Container>
        </Atoms.Container>
      )}
    </Atoms.Container>
  );
}
