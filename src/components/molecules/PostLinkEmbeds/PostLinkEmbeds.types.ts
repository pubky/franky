import * as Providers from './Providers';

export type PostLinkEmbedsProps = {
  content: string;
};

export type ParseContentForLinkEmbedResult = {
  embed: { url: string } | null;
  provider: Providers.EmbedProvider | null;
};
