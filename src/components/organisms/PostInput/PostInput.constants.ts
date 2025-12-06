export const POST_INPUT_VARIANT = {
  REPLY: 'reply',
  POST: 'post',
} as const;

export const POST_INPUT_PLACEHOLDER = {
  [POST_INPUT_VARIANT.REPLY]: 'Write a reply...',
  [POST_INPUT_VARIANT.POST]: "What's on your mind?",
} as const;
