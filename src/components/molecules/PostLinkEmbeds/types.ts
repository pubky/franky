export type EmbedType = 'youtube' | 'vimeo' | 'twitch' | 'twitter' | 'generic';
export type LinkEmbed = { type: EmbedType | 'none'; url: string };
