export type TBookmarkPersistInput = {
  postId: string; // Composite post ID (authorId:postId)
  bookmarkUrl: string;
  bookmarkJson?: Record<string, unknown>;
};

export type TCreateBookmarkInput = Required<TBookmarkPersistInput>;

export type TDeleteBookmarkInput = Omit<TCreateBookmarkInput, 'bookmarkJson'>;
