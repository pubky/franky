import type { PostDetailsModel } from '@/core';

export type PostAttachmentsProps = {
  attachments: PostDetailsModel['attachments'];
};

export type AttachmentConstructed = {
  type: string;
  name: string;
  urls: {
    main: string;
    feed?: string;
  };
};
