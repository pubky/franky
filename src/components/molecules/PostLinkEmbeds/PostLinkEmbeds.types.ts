import * as Providers from './Providers';

export type PostLinkEmbedsProps = {
  content: string;
};

export type ParseContentForLinkEmbedResult = {
  embed: Providers.EmbedData | null;
  provider: Providers.EmbedProvider | null;
};
