'use client';

import * as Atoms from '@/atoms';
import { useToast, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/molecules';
import type { CarouselApi } from '@/molecules';
import * as Icons from '@/libs/icons';
import type { AttachmentConstructed } from '../PostAttachments.types';
import { PostAttachmentsCarouselImage } from '../PostAttachmentsCarouselImage';
import { useEffect, useState } from 'react';

type PostAttachmentsImagesAndVideosProps = {
  imagesAndVideos: AttachmentConstructed[];
};

export const PostAttachmentsImagesAndVideos = ({
  imagesAndVideos,
}: PostAttachmentsImagesAndVideosProps): React.ReactElement => {
  const total = imagesAndVideos.length;
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { toast } = useToast();

  const handleFullscreen = (): void => {
    const currentMedia = document.getElementById(`media-item-${currentIndex}`);

    if (currentMedia) {
      currentMedia.requestFullscreen().catch((error) => {
        toast({ title: 'Error attempting to enable fullscreen', description: error });
      });
    }
  };

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Atoms.Dialog open={open} onOpenChange={setOpen}>
      {/* Grid layout */}
      <Atoms.Container display="grid" className="gap-3 sm:grid-cols-2">
        {imagesAndVideos.map((media, i) => (
          <Atoms.Container
            key={i}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="h-52 only:h-96 sm:last:odd:col-span-2"
          >
            {media.type.startsWith('image') ? (
              <Atoms.DialogTrigger asChild>
                <Atoms.Button
                  overrideDefaults
                  onClick={() => setCurrentIndex(i)}
                  className="relative h-full w-full cursor-pointer"
                >
                  <Atoms.Image
                    src={media.type === 'image/gif' ? media.urls.main : (media.urls.feed as string)}
                    alt={media.name}
                    fill
                    className="rounded-md object-cover object-center"
                  />
                </Atoms.Button>
              </Atoms.DialogTrigger>
            ) : (
              <Atoms.Video src={media.urls.main} pauseVideo={open} className="h-full w-full cursor-auto" />
            )}
          </Atoms.Container>
        ))}
      </Atoms.Container>

      {/* Carousel dialog */}
      <Atoms.DialogContent
        hiddenTitle="Post Attachments Media Carousel"
        aria-describedby={undefined}
        showCloseButton={false}
        overrideDefaults
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Atoms.DialogClose className="absolute top-4 right-4 z-60 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[rgba(5,5,10,0.30)] text-secondary-foreground/70 transition-colors hover:bg-[rgba(5,5,10,0.40)] hover:text-secondary-foreground">
          <Icons.X className="size-4" />
        </Atoms.DialogClose>

        <Carousel
          opts={{
            startIndex: currentIndex,
            loop: true,
          }}
          setApi={setApi}
          className="w-full max-w-80 xsm:max-w-dvw sm:max-w-[75dvw] 2xl:max-w-[50dvw]"
        >
          <CarouselContent className="-ml-3 items-center">
            {imagesAndVideos.map((media, i) => (
              <CarouselItem key={i} className="basis-full pl-3">
                {media.type.startsWith('image') ? (
                  <PostAttachmentsCarouselImage id={`media-item-${i}`} image={media} />
                ) : (
                  <Atoms.Video
                    id={`media-item-${i}`}
                    src={media.urls.main}
                    pauseVideo={currentIndex !== i}
                    className="max-h-[75dvh] w-full"
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>

          {total > 1 && (
            <>
              <CarouselPrevious className="hidden hover:bg-secondary sm:inline-flex" />
              <CarouselNext className="hidden hover:bg-secondary sm:inline-flex" />
            </>
          )}
        </Carousel>

        <Atoms.Container className="mt-8 flex-row items-center justify-center gap-x-5.5">
          <Atoms.Button
            onClick={handleFullscreen}
            disabled={!document.fullscreenEnabled}
            variant="secondary"
            size="sm"
            className="text-xs hover:bg-secondary"
          >
            Fullscreen <Icons.Maximize className="size-3" />
          </Atoms.Button>

          {total > 1 && (
            <Atoms.Typography size="xs" className="text-muted-foreground">
              {currentIndex + 1}/{total}
            </Atoms.Typography>
          )}
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
};
