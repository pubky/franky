export type TCreateBookmarkInput = {
  postId: string; // Composite post ID (authorId:postId)
  bookmarkUrl: string;
  bookmarkJson: Record<string, unknown>;
};

export type TDeleteBookmarkInput = Omit<TCreateBookmarkInput, 'bookmarkJson'>;
