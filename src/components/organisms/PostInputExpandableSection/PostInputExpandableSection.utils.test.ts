import { describe, it, expect } from 'vitest';
import { getButtonLabel } from './PostInputExpandableSection.utils';
import { POST_INPUT_VARIANT } from '../PostInput/PostInput.constants';

describe('getButtonLabel', () => {
  it('returns "Post" for POST variant', () => {
    expect(getButtonLabel(POST_INPUT_VARIANT.POST)).toBe('Post');
  });

  it('returns "Reply" for REPLY variant', () => {
    expect(getButtonLabel(POST_INPUT_VARIANT.REPLY)).toBe('Reply');
  });

  it('returns "Repost" for REPOST variant', () => {
    expect(getButtonLabel(POST_INPUT_VARIANT.REPOST)).toBe('Repost');
  });

  it('returns "Post" for undefined variant', () => {
    expect(getButtonLabel(undefined)).toBe('Post');
  });

  it('returns "Post" for unknown variant', () => {
    // @ts-expect-error - testing invalid input
    expect(getButtonLabel('unknown')).toBe('Post');
  });

  // Note: In practice, isArticle is only true when variant is POST (article sub-mode).
  // These tests cover the function's actual behavior exhaustively for completeness.
  describe('isArticle parameter', () => {
    it('returns "Publish" when isArticle is true', () => {
      expect(getButtonLabel(POST_INPUT_VARIANT.POST, true)).toBe('Publish');
    });

    it('returns "Publish" when isArticle is true regardless of variant', () => {
      expect(getButtonLabel(POST_INPUT_VARIANT.REPLY, true)).toBe('Publish');
      expect(getButtonLabel(POST_INPUT_VARIANT.REPOST, true)).toBe('Publish');
      expect(getButtonLabel(undefined, true)).toBe('Publish');
    });

    it('returns variant label when isArticle is false', () => {
      expect(getButtonLabel(POST_INPUT_VARIANT.POST, false)).toBe('Post');
      expect(getButtonLabel(POST_INPUT_VARIANT.REPLY, false)).toBe('Reply');
    });

    it('returns variant label when isArticle is undefined', () => {
      expect(getButtonLabel(POST_INPUT_VARIANT.POST, undefined)).toBe('Post');
      expect(getButtonLabel(POST_INPUT_VARIANT.REPLY, undefined)).toBe('Reply');
    });
  });
});
