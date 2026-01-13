/**
 * Type of moderated content
 */
export enum ModerationType {
  POST = 'post',
  PROFILE = 'profile',
}

export interface ModerationModelSchema {
  /**
   * The unique ID of the moderated item.
   * For posts: composite ID (authorId:postId)
   * For profiles: user pubky
   */
  id: string;

  /**
   * Type of content being moderated
   */
  type: ModerationType;

  /**
   * Whether the content is currently blurred.
   * When false, the user has chosen to unblur this item.
   */
  is_blurred: boolean;

  /**
   * Timestamp when the item was added to moderation
   */
  created_at: number;
}

/**
 * Dexie table schema for moderation
 * - Primary key: id
 * - Indexed: type (for filtering by content type)
 * - Indexed: is_blurred (for filtering blurred items)
 * - Indexed: created_at (for sorting)
 */
export const moderationTableSchema = `
  &id,
  type,
  is_blurred,
  created_at
`;
