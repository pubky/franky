'use client';

import { ChangeEvent, Dispatch, SetStateAction, forwardRef, useEffect, useMemo } from 'react';
import * as Atoms from '@/atoms';
import * as Icons from '@/libs/icons';
import * as Utils from '@/libs/utils';
import { ATTACHMENT_ACCEPT_STRING } from '@/config';

type PostInputAttachmentsProps = {
  attachments: File[];
  setAttachments: Dispatch<SetStateAction<File[]>>;
  handleFilesAdded: (files: File[]) => void;
  isSubmitting: boolean;
};

type AttachmentType = 'image' | 'video' | 'audio' | 'pdf';

type AttachmentWithPreview = {
  file: File;
  type: AttachmentType;
  previewUrl: string;
};

const getAttachmentType = (file: File) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type === 'application/pdf') return 'pdf';
};

export const PostInputAttachments = forwardRef<HTMLInputElement, PostInputAttachmentsProps>(
  ({ attachments, setAttachments, handleFilesAdded, isSubmitting }, ref) => {
    const attachmentsWithPreviews: AttachmentWithPreview[] = useMemo(
      () =>
        attachments.map((file) => {
          const type = getAttachmentType(file) as AttachmentType;

          return {
            file,
            type,
            previewUrl: URL.createObjectURL(file),
          };
        }),
      [attachments],
    );

    // Cleanup object URLs when attachments change or component unmounts
    useEffect(() => {
      return () => {
        attachmentsWithPreviews.forEach((attachment) => {
          URL.revokeObjectURL(attachment.previewUrl);
        });
      };
    }, [attachmentsWithPreviews]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFilesAdded(files);

      // Reset input so the same file can be selected again
      e.target.value = '';
    };

    return (
      <>
        <Atoms.Input
          ref={ref}
          type="file"
          accept={ATTACHMENT_ACCEPT_STRING}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {attachmentsWithPreviews.length ? (
          <Atoms.Container className="gap-4">
            {attachmentsWithPreviews.map((a, i) => (
              <Atoms.Container key={a.previewUrl} className="relative">
                <Atoms.Button
                  variant="dark"
                  size="icon"
                  onClick={() => setAttachments((prev) => prev.filter((_, index) => index !== i))}
                  disabled={isSubmitting}
                  className={Utils.cn(
                    'absolute right-4 z-10 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100',
                    a.type === 'image' || a.type === 'video' ? 'top-4 size-12' : 'top-1/2 -translate-y-1/2',
                    a.type === 'audio' && 'size-6',
                    a.type === 'pdf' && 'size-8',
                  )}
                >
                  <Icons.Trash2 className={Utils.cn(a.type === 'audio' ? 'size-3' : 'size-4')} />
                </Atoms.Button>

                {a.type === 'image' && (
                  <Atoms.Image
                    src={a.previewUrl}
                    alt="Image preview"
                    className="h-48 w-full cursor-auto rounded-md bg-black object-contain"
                  />
                )}

                {a.type === 'video' && <Atoms.Video src={a.previewUrl} className="h-48 w-full cursor-auto" />}

                {a.type === 'audio' && <Atoms.Audio src={a.previewUrl} className="w-full cursor-auto" />}

                {a.type === 'pdf' && (
                  <Atoms.Container className="cursor-auto flex-row items-center gap-x-2 rounded-md bg-muted p-4 pr-14">
                    <Icons.FileText className="size-6 shrink-0" />

                    <Atoms.Typography size="sm" className="font-bold break-all">
                      {a.file.name}
                    </Atoms.Typography>
                  </Atoms.Container>
                )}
              </Atoms.Container>
            ))}
          </Atoms.Container>
        ) : null}
      </>
    );
  },
);

PostInputAttachments.displayName = 'PostInputAttachments';
