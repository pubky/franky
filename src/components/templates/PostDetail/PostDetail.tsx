'use client';

import { useEffect, useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

interface PostProps {
  profileId: string;
  postId: string;
}

export function PostDetail({ profileId, postId }: PostProps) {
  const [postData, setPostData] = useState<Core.NexusPost | null>(null);
  const [replies, setReplies] = useState<Core.NexusPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fetchedPost, fetchedReplies] = await Promise.all([
          Core.PostController.findById(postId),
          Core.PostController.getReplies(postId),
        ]);

        if (fetchedPost) {
          setPostData(fetchedPost);
          setReplies(fetchedReplies);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [postId]);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    try {
      const createdReply = await Core.PostController.addReply(
        postId,
        replyContent.trim(),
        'current-user-123' // TODO: get current user
      );

      if (createdReply) {
        // Add the new reply to the replies list
        setReplies(prev => [...prev, createdReply]);
        // Clear the textarea after successful submission
        setReplyContent('');
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
  };

  if (loading) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-muted-foreground">
          Loading post...
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (error) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-destructive">
          Error: {error}
        </Atoms.Typography>
      </Atoms.Container>
    );
  }

  if (!postData) {
    return (
      <Atoms.Container className="flex justify-center items-center py-8">
        <Atoms.Typography size="md" className="text-muted-foreground">
          No post data available
        </Atoms.Typography>
      </Atoms.Container>
    );
  }


  return (
    <Atoms.Container className="flex flex-col gap-4">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Atoms.Typography>Post by {postData.details.author}</Atoms.Typography>
        <Molecules.PostWide post={postData} />
      </Atoms.Container>

      {/* Replies */}
      <Atoms.Container size="container" className="px-6 pb-8">
        <Atoms.Container className="flex flex-col gap-4">
          {replies.map((reply) => (
            <Atoms.Container key={reply.details.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '1rem' }}>
              <Atoms.ReplyConnector />
              <Molecules.PostWide post={reply} />
            </Atoms.Container>
          ))}
        </Atoms.Container>

        {/* Reply textarea */}
        <Atoms.Container className="mt-4" style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '1rem' }}>
          <Atoms.ReplyConnector variant="terminal" />
          <Atoms.Textarea
            placeholder="Write a reply..."
            className="min-h-20"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
