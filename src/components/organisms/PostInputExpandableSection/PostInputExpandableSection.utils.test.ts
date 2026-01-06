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
});
