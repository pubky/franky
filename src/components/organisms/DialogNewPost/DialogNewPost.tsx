'use client';

import { useState, useRef } from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import type { DialogNewPostProps } from './DialogNewPost.types';

export function DialogNewPost({ open, onOpenChangeAction }: DialogNewPostProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [postInputKey, setPostInputKey] = useState(0);
  const contentRef = useRef({ content: '', tags: [] as string[] });

  const hasContent = () => {
    return contentRef.current.content.trim().length > 0 || contentRef.current.tags.length > 0;
  };

  const handleContentChange = (content: string, tags: string[]) => {
    contentRef.current = { content, tags };
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setShowConfirmDialog(false);
      contentRef.current = { content: '', tags: [] };
    } else {
      if (hasContent() && !showConfirmDialog) {
        setShowConfirmDialog(true);
      } else {
        onOpenChangeAction(false);
      }
    }
  };

  const handleDiscard = () => {
    setPostInputKey((prev) => prev + 1);
    setShowConfirmDialog(false);
    onOpenChangeAction(false);
  };

  return (
    <>
      <Organisms.DialogConfirmDiscard
        open={showConfirmDialog}
        onOpenChange={() => setShowConfirmDialog(false)}
        onConfirm={handleDiscard}
      />
      <Atoms.Dialog open={open} onOpenChange={handleOpenChange}>
        <Atoms.DialogContent className="w-3xl" hiddenTitle="New post">
          <Atoms.DialogHeader>
            <Atoms.DialogTitle>New Post</Atoms.DialogTitle>
            <Atoms.DialogDescription className="sr-only">New post dialog</Atoms.DialogDescription>
          </Atoms.DialogHeader>
          <Atoms.Container className="gap-3">
            <Organisms.PostInput
              key={postInputKey}
              variant={POST_INPUT_VARIANT.POST}
              onSuccess={() => onOpenChangeAction(false)}
              expanded={true}
              onContentChange={handleContentChange}
            />
          </Atoms.Container>
        </Atoms.DialogContent>
      </Atoms.Dialog>
    </>
  );
}
