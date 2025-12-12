'use client';

import * as Core from '@/core';
import * as Atoms from '@/atoms';
import { useToast } from '@/molecules';
import { useEffect, useState } from 'react';
import type { AttachmentConstructed, PostAttachmentsProps } from './PostAttachments.types';
import { PostAttachmentsImagesAndVideos } from './PostAttachmentsImagesAndVideos';
import { PostAttachmentsAudios } from './PostAttachmentsAudios';
import { PostAttachmentsGenericFiles } from './PostAttachmentsGenericFiles';

export const PostAttachments = ({ attachments }: PostAttachmentsProps) => {
  const [imagesAndVideos, setImagesAndVideos] = useState<AttachmentConstructed[]>([]);
  const [audios, setAudios] = useState<AttachmentConstructed[]>([]);
  const [genericFiles, setGenericFiles] = useState<AttachmentConstructed[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const constructAttachments = async () => {
      if (!attachments?.length) return;

      try {
        const result = await Core.FileController.getMetadata({ fileAttachments: attachments });

        const imagesAndVideos: AttachmentConstructed[] = [];
        const audios: AttachmentConstructed[] = [];
        const genericFiles: AttachmentConstructed[] = [];

        result.forEach((a) => {
          const { content_type, name, id } = a;

          const isImage = content_type.startsWith('image');
          const isVideo = content_type.startsWith('video');
          const isAudio = content_type.startsWith('audio');

          if (isImage || isVideo) {
            imagesAndVideos.push({
              type: content_type,
              name,
              urls: {
                main: Core.FileController.getFileUrl({ fileId: id, variant: Core.FileVariant.MAIN }),
                feed: isImage
                  ? Core.FileController.getFileUrl({ fileId: id, variant: Core.FileVariant.FEED })
                  : undefined,
              },
            });
          } else if (isAudio) {
            audios.push({
              type: content_type,
              name,
              urls: { main: Core.FileController.getFileUrl({ fileId: id, variant: Core.FileVariant.MAIN }) },
            });
          } else {
            genericFiles.push({
              type: content_type,
              name,
              urls: { main: Core.FileController.getFileUrl({ fileId: id, variant: Core.FileVariant.MAIN }) },
            });
          }
        });

        setImagesAndVideos(imagesAndVideos);
        setAudios(audios);
        setGenericFiles(genericFiles);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to load post attachments',
        });
      }
    };

    constructAttachments();
  }, [attachments, toast]);

  if (!imagesAndVideos.length && !audios.length && !genericFiles.length) return null;

  return (
    <Atoms.Container className="gap-3">
      {imagesAndVideos.length ? <PostAttachmentsImagesAndVideos imagesAndVideos={imagesAndVideos} /> : null}
      {audios.length ? <PostAttachmentsAudios audios={audios} /> : null}
      {genericFiles.length ? <PostAttachmentsGenericFiles genericFiles={genericFiles} /> : null}
    </Atoms.Container>
  );
};
