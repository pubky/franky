export const POST_INPUT_VARIANT = {
  REPLY: 'reply',
  POST: 'post',
} as const;

export type PostInputVariant = (typeof POST_INPUT_VARIANT)[keyof typeof POST_INPUT_VARIANT];
