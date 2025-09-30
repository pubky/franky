'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Templates from '@/templates';

interface PostRepliesProps {
  postId: string;
}

export function PostReplies({ postId }: PostRepliesProps) {
  const replies = useLiveQuery(
    () =>
      Core.db.post_relationships
        .where('replied')
        .equals(postId)
        .toArray()
        .then((replyRelationships) => {
          if (replyRelationships.length === 0) return [];

          const replyPostIds = replyRelationships.map((rel) => rel.id);

          // Fetch all related data
          return Promise.all([
            Core.db.post_details.where('id').anyOf(replyPostIds).toArray(),
            Core.db.post_counts.where('id').anyOf(replyPostIds).toArray(),
            Core.db.post_tags.where('id').anyOf(replyPostIds).toArray(),
            Core.db.post_relationships.where('id').anyOf(replyPostIds).toArray(),
          ]).then(([postDetails, countsData, tagsData, relationshipsData]) => {
            // Create lookup maps
            const countsMap = new Map(countsData.map((c) => [c.id, c]));
            const relationshipsMap = new Map(relationshipsData.map((r) => [r.id, r]));

            // Group tags by post ID
            const tagsMap = new Map<string, Core.TagModel[]>();
            tagsData.forEach((tagCollection) => {
              tagsMap.set(tagCollection.id, tagCollection.tags as Core.TagModel[]);
            });

            // Combine into NexusPost objects
            return postDetails.map(
              (details): Core.NexusPost => ({
                details,
                counts: countsMap.get(details.id)!,
                tags: tagsMap.get(details.id) || [],
                relationships: relationshipsMap.get(details.id)!,
                bookmark: null,
              }),
            );
          });
        }),
    [postId],
    [],
  );

  return (
    <Atoms.Container className="flex flex-col gap-4">
      {replies?.map((reply) => (
        <div key={reply.details.id} className="flex gap-4">
          <div className="w-8 flex-shrink-0">{/* Reply connector SVG will go here */}</div>
          <div className="flex-1">
            <Templates.PostWide post={reply} showReplyConnector={true} replyConnectorVariant="default" />
          </div>
        </div>
      ))}
    </Atoms.Container>
  );
}
