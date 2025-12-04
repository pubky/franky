/**
 * Variant constants for PostThreadConnector component
 */
export const POST_THREAD_CONNECTOR_VARIANTS = {
  REGULAR: 'regular',
  LAST: 'last',
  GAP_FIX: 'gap-fix',
  DIALOG_REPLY: 'dialog-reply',
} as const;

export type PostThreadConnectorVariant =
  (typeof POST_THREAD_CONNECTOR_VARIANTS)[keyof typeof POST_THREAD_CONNECTOR_VARIANTS];
