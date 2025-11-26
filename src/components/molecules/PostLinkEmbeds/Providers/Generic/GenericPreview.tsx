'use client';

import * as Atoms from '@/atoms';
import * as Icons from '@/libs/icons';
import * as Hooks from '@/hooks';

interface GenericPreviewProps {
  url: string;
}

/**
 * Generic website preview component using SWR for caching
 * Fetches OpenGraph metadata via /api/og-metadata
 */
export function GenericPreview({ url }: GenericPreviewProps) {
  const { metadata, isLoading, error } = Hooks.useOgMetadata(url);

  if (isLoading) {
    return (
      <Atoms.Typography size="sm" className="text-muted-foreground">
        Loading preview...
      </Atoms.Typography>
    );
  }

  if (error || !metadata) {
    return null;
  }

  const { url: displayUrl, title, image } = metadata;

  return (
    <Atoms.Link data-testid="generic-website-preview" href={url}>
      <Atoms.Container
        overrideDefaults
        className="flex w-full max-w-full min-w-auto flex-wrap items-start gap-6 rounded-md bg-muted p-6 lg:max-w-[520px] xl:max-w-full"
      >
        <Atoms.Container overrideDefaults className="flex min-w-0 flex-1 flex-col gap-2">
          {title && (
            <Atoms.Typography size="lg" className="wrap-break-word">
              {title}
            </Atoms.Typography>
          )}

          <Atoms.Container overrideDefaults className="flex flex-row items-center gap-1">
            <Icons.Globe size={13} className="shrink-0 text-muted-foreground" />

            <Atoms.Typography
              size="sm"
              className="min-w-0 flex-1 overflow-hidden font-medium text-ellipsis whitespace-nowrap text-muted-foreground"
            >
              {displayUrl}
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>

        {image && (
          <Atoms.Image
            src={image}
            alt="Website social image"
            width={180}
            height={100}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.style.display = 'none';
            }}
            className="h-25 w-45 shrink-0 rounded-md object-cover object-center"
          />
        )}
      </Atoms.Container>
    </Atoms.Link>
  );
}
