import * as Atoms from '@/atoms';
import * as Icons from '@/libs/icons';
import * as ProviderTypes from '../Provider.types';
import * as ProviderActions from '../Provider.actions';

/**
 * Generic embed provider
 * Implements the standard EmbedProvider interface
 */
export const Generic: ProviderTypes.EmbedProvider = {
  /**
   * This provider will support all domains not included in the others
   */
  domains: [],

  /**
   * Parse Generic URL and return embed information
   */
  parseEmbed: async (url: string): Promise<ProviderTypes.EmbedData | null> => {
    const metadata = await ProviderActions.fetchOpenGraphMetadata(url);

    if (!metadata) return null;

    return { type: 'metadata', value: metadata };
  },

  /**
   * Render Generic website preview
   */
  renderEmbed: (embedData: ProviderTypes.EmbedData) => {
    // Type guard: ensure we have a METADATA type
    if (embedData.type !== 'metadata') return null;

    const { url, title, image } = embedData.value;

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
                {url}
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
  },
};
