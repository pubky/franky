import * as Core from '@/core';

export type TCreateBookmarkInput = Core.TBookmarkEventParams & {
  bookmarkUrl: string;
  bookmarkJson: Record<string, unknown>;
};

export type TDeleteBookmarkInput = Omit<Core.TCreateBookmarkInput, 'bookmarkJson'>;

export type TLocalBookmarkParams = {
  userId: Core.Pubky;
  postId: string; // Composite post ID
};
