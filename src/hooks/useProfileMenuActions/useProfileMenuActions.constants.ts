/**
 * Profile Menu Action Item IDs
 * Used to identify menu items in the profile menu actions
 */
export const PROFILE_MENU_ACTION_IDS = {
  FOLLOW: 'follow',
  COPY_PUBKY: 'copy-pubky',
  COPY_LINK: 'copy-link',
  MUTE: 'mute',
} as const;

/**
 * Profile Menu Action Variants
 * Note: DESTRUCTIVE is reserved for future actions like block user
 */
export const PROFILE_MENU_ACTION_VARIANTS = {
  DEFAULT: 'default',
  DESTRUCTIVE: 'destructive',
} as const;
