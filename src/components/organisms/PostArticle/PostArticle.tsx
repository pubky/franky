'use client';

import type { PostDetailsModel } from '@/core';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

interface PostArticleProps {
  content: string;
  attachments: PostDetailsModel['attachments'];
  className?: string;
}

export const PostArticle = ({ content, attachments, className }: PostArticleProps) => {
  const { title, body, coverImage } = Hooks.usePostArticle({
    content,
    attachments,
    coverImageVariant: Core.FileVariant.FEED,
  });

  return (
    <Atoms.Container className={Libs.cn('justify-between gap-6 lg:flex-row', className)}>
      <Atoms.Container className="gap-y-1">
        <Atoms.Typography size="lg" className="wrap-anywhere hyphens-auto">
          {title}
        </Atoms.Typography>

        <Molecules.PostText content={body} isArticle className="text-muted-foreground" />
      </Atoms.Container>

      {coverImage && (
        <Atoms.Image
          src={coverImage.src}
          alt={coverImage.alt}
          className="h-25 w-45 rounded-md object-cover object-center"
          width={180}
          height={100}
        />
      )}
    </Atoms.Container>
  );
};
