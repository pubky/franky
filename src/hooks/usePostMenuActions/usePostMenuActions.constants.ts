/**
 * Post Menu Action Item IDs
 * Used to identify menu items in the post menu actions
 */
export const POST_MENU_ACTION_IDS = {
  FOLLOW: 'follow',
  COPY_PUBKY: 'copy-pubky',
  COPY_LINK: 'copy-link',
  COPY_TEXT: 'copy-text',
  MUTE: 'mute',
  REPORT: 'report',
  DELETE: 'delete',
} as const;

/**
 * Post Menu Action Variants
 */
export const POST_MENU_ACTION_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
} as const;
