export const POST_INPUT_VARIANT = {
  REPLY: 'reply',
  POST: 'post',
  REPOST: 'repost',
} as const;

export const POST_INPUT_PLACEHOLDER = {
  [POST_INPUT_VARIANT.REPLY]: 'Write a reply...',
  [POST_INPUT_VARIANT.POST]: "What's on your mind?",
  [POST_INPUT_VARIANT.REPOST]: 'Optional comment',
} as const;

export const POST_INPUT_BUTTON_LABEL = {
  [POST_INPUT_VARIANT.REPLY]: 'Reply',
  [POST_INPUT_VARIANT.POST]: 'Post',
  [POST_INPUT_VARIANT.REPOST]: 'Repost',
} as const;
