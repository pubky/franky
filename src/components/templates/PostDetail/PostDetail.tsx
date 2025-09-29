'use client';

import { useEffect, useState } from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';

interface PostProps {
  postId: string;
}

export function PostDetail({ postId }: PostProps) {
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
        'current-user-123', // TODO: get current user
      );

      if (createdReply) {
        // Add the new reply to the replies list
        setReplies((prev) => [...prev, createdReply]);

        // Update the parent post's reply count
        setPostData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            counts: {
              ...prev.counts,
              replies: prev.counts.replies + 1,
            },
          };
        });

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
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Atoms.Typography>Post by {postData.details.author}</Atoms.Typography>
        <Molecules.PostWide post={postData} />
      </Atoms.Container>

      {/* Replies */}
      <Atoms.Container size="container" className="px-6 pb-8 mt-4">
        <Atoms.Container className="flex flex-col gap-4">
          {replies.map((reply) => (
            <div key={reply.details.id} className="flex gap-4">
              <div className="w-8 flex-shrink-0">{/* Reply connector SVG will go here */}</div>
              <div className="flex-1">
                <Molecules.PostWide post={reply} showReplyConnector={true} replyConnectorVariant="default" />
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <div className="w-8 flex-shrink-0">
              <svg width="48" height="50" viewBox="0 0 48 50" preserveAspectRatio="xMinYMin meet">
                <path
                  d="M 16 0 v 42 a 8 8 0 0 0 8 8 h 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="flex-1">
              <Atoms.Textarea
                placeholder="Write a reply..."
                className="min-h-20"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
