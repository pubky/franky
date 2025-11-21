import * as Providers from './Providers';

export type PostLinkEmbedsProps = {
  content: string;
};

export type ParseContentForLinkEmbedResult = {
  embed: { data: string } | null;
  provider: Providers.EmbedProvider | null;
};
