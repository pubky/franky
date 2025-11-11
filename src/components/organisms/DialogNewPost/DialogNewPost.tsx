'use client';

import { useState } from 'react';
import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Shared from '@/shared/postActionVariants';

interface DialogNewPostProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DialogNewPost({ open, onOpenChange }: DialogNewPostProps) {
  const [isArticleMode, setIsArticleMode] = useState(false);

  const handleArticleClick = () => {
    setIsArticleMode(true);
  };

  const handleSuccess = () => {
    setIsArticleMode(false);
    onOpenChange?.(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsArticleMode(false);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Atoms.Dialog open={open} onOpenChange={handleOpenChange}>
      <Atoms.DialogContent className="w-3xl" hiddenTitle={isArticleMode ? 'New Article' : 'New Post'}>
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>{isArticleMode ? 'New Article' : 'New Post'}</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        {isArticleMode ? (
          <Organisms.DialogArticleInput onSuccess={handleSuccess} />
        ) : (
          <Atoms.Container className="flex flex-col gap-3">
            <Organisms.DialogPostInput
              variant={Shared.POST_ACTION_VARIANT.NEW}
              onArticleClick={handleArticleClick}
              onSuccess={handleSuccess}
            />
          </Atoms.Container>
        )}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
