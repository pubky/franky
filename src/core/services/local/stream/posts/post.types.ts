import * as Core from '@/core';

export type TPostStreamUpsertParams = {
  streamId: Core.PostStreamId;
  stream: string[];
};

export type TPostStreamBulkParams = {
  postStreams: TPostStreamUpsertParams[];
};

export type TPrependToStreamParams = {
  streamId: Core.PostStreamId;
  compositePostId: string;
};

export type TAddReplyToStreamParams = {
  repliedUri: string | null | undefined;
  replyPostId: string;
  postReplies: Record<Core.ReplyStreamCompositeId, string[]>;
};

export type THandleNotCommonStreamParamsParams = {
  authorId: Core.Pubky;
  postId: string | undefined;
};

export type TPersistPostsParams = {
  posts: Core.NexusPost[];
};

export type TPostStreamPersistResult = {
  postAttachments: string[];
};

export type TSetStreamPaginationParams = {
  params: Core.TStreamBase;
  streamTail: number;
  streamHead?: number;
};
