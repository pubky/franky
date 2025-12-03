import * as Core from '@/core';

const MIN_TAGS = 1;
const MAX_TAGS = 5;

export class FeedValidators {
  private constructor() {}

  /**
   * Validates and normalizes tags for a feed.
   * Throws an error if validation fails.
   *
   * @param tags - Array of tag strings to validate
   * @returns Normalized array of unique, lowercase tags
   * @throws Error if tags are invalid
   */
  static validateTags(tags: string[] | undefined | null): string[] {
    if (!tags || tags.length < MIN_TAGS) {
      throw new Error('At least one tag is required');
    }

    if (tags.length > MAX_TAGS) {
      throw new Error(`Maximum ${MAX_TAGS} tags allowed`);
    }

    const normalizedTags = [...new Set(tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))];

    if (normalizedTags.length < MIN_TAGS) {
      throw new Error('At least one unique tag is required');
    }

    return normalizedTags;
  }

  /**
   * Validates that params are valid for DELETE action.
   * Throws an error if validation fails.
   *
   * @param params - Parameters to validate
   * @throws Error if params are invalid for DELETE action
   */
  static validateDeleteParams(params: Core.TFeedPersistParams): asserts params is Core.TFeedPersistDeleteParams {
    if (!Core.isFeedDeleteParams(params)) {
      throw new Error('Invalid params for DELETE action');
    }
  }

  /**
   * Validates that params are valid for PUT action.
   * Throws an error if validation fails.
   *
   * @param params - Parameters to validate
   * @throws Error if params are invalid for PUT action
   */
  static validatePutParams(params: Core.TFeedPersistParams): asserts params is Core.TFeedPersistCreateParams {
    if (Core.isFeedDeleteParams(params)) {
      throw new Error('Invalid params for PUT action');
    }
  }
}
