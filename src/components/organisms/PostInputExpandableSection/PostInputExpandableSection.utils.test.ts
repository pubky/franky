import { describe, it, expect } from 'vitest';
import { getButtonLabel } from './PostInputExpandableSection.utils';
import { POST_INPUT_ACTION_SUBMIT_MODE } from '../PostInputActionBar/PostInputActionBar.constants';

describe('getButtonLabel', () => {
  it('returns "Post" for POST mode', () => {
    expect(getButtonLabel(POST_INPUT_ACTION_SUBMIT_MODE.POST)).toBe('Post');
  });

  it('returns "Reply" for REPLY mode', () => {
    expect(getButtonLabel(POST_INPUT_ACTION_SUBMIT_MODE.REPLY)).toBe('Reply');
  });

  it('returns "Repost" for REPOST mode', () => {
    expect(getButtonLabel(POST_INPUT_ACTION_SUBMIT_MODE.REPOST)).toBe('Repost');
  });

  it('returns "Post" for undefined mode', () => {
    expect(getButtonLabel(undefined)).toBe('Post');
  });

  it('returns "Post" for unknown mode', () => {
    // @ts-expect-error - testing invalid input
    expect(getButtonLabel('unknown')).toBe('Post');
  });
});
