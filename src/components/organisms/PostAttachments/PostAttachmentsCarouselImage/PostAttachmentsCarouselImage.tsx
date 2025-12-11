'use client';

import * as Atoms from '@/atoms';
import { useState } from 'react';
import type { AttachmentConstructed } from '../PostAttachments.types';

type PostAttachmentsCarouselImageProps = {
  image: AttachmentConstructed;
  id: string;
};

export const PostAttachmentsCarouselImage = ({ image, id }: PostAttachmentsCarouselImageProps): React.ReactElement => {
  const [isMainLoaded, setIsMainLoaded] = useState(image.type === 'image/gif');

  return (
    <>
      {/* Feed image shown as placeholder while main loads */}
      {!isMainLoaded && (
        <Atoms.Image
          src={image.urls.feed as string}
          alt={image.name}
          className="max-h-[75dvh] w-full rounded-md object-cover object-center"
        />
      )}

      {/* Main high-res image */}
      <Atoms.Image
        id={isMainLoaded ? id : undefined}
        src={image.urls.main}
        alt={image.name}
        className={isMainLoaded ? 'max-h-[75dvh] w-full rounded-md object-cover object-center' : 'size-0'}
        onLoad={() => setIsMainLoaded(true)}
      />
    </>
  );
};
