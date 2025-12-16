import { describe, it, expect } from 'vitest';
import { detectModeration, shouldBlur } from './moderation.utils';
import * as Core from '@/core';
import * as Config from '@/config';

describe('detectModeration', () => {
  it('should return false for null tag collection', () => {
    expect(detectModeration(null)).toBe(false);
  });

  it('should return false for undefined tag collection', () => {
    expect(detectModeration(undefined)).toBe(false);
  });

  it('should return false for empty tags array', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [],
    };
    expect(detectModeration(tagCollection)).toBe(false);
  });

  it('should return false when tag matches but tagger does not', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [
        {
          label: Config.MODERATED_TAGS[0],
          taggers: ['different_tagger'],
        },
      ],
    };
    expect(detectModeration(tagCollection)).toBe(false);
  });

  it('should return false when tagger matches but tag does not', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [
        {
          label: 'safe_tag',
          taggers: [Config.MODERATION_ID],
        },
      ],
    };
    expect(detectModeration(tagCollection)).toBe(false);
  });

  it('should return true when both tag and tagger match', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [
        {
          label: Config.MODERATED_TAGS[0],
          taggers: [Config.MODERATION_ID],
        },
      ],
    };
    expect(detectModeration(tagCollection)).toBe(true);
  });

  it('should return true when moderation tag is among multiple tags', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [
        {
          label: 'safe_tag',
          taggers: ['user1'],
        },
        {
          label: Config.MODERATED_TAGS[0],
          taggers: [Config.MODERATION_ID],
        },
        {
          label: 'another_tag',
          taggers: ['user2'],
        },
      ],
    };
    expect(detectModeration(tagCollection)).toBe(true);
  });

  it('should return true when moderation tagger is among multiple taggers', () => {
    const tagCollection: Core.TagCollectionModelSchema<string> = {
      id: 'post1',
      tags: [
        {
          label: Config.MODERATED_TAGS[0],
          taggers: ['user1', Config.MODERATION_ID, 'user2'],
        },
      ],
    };
    expect(detectModeration(tagCollection)).toBe(true);
  });
});

describe('shouldBlur', () => {
  describe('when blur is disabled globally', () => {
    it('should return false regardless of moderation state', () => {
      expect(shouldBlur(true, true, true)).toBe(false);
      expect(shouldBlur(true, false, true)).toBe(false);
      expect(shouldBlur(false, true, true)).toBe(false);
      expect(shouldBlur(false, false, true)).toBe(false);
    });
  });

  describe('when blur is enabled globally', () => {
    it('should return false when post is not moderated', () => {
      expect(shouldBlur(false, true, false)).toBe(false);
      expect(shouldBlur(false, false, false)).toBe(false);
    });

    it('should return false when post is moderated but user unblurred it', () => {
      expect(shouldBlur(true, false, false)).toBe(false);
    });

    it('should return true when post is moderated and still blurred', () => {
      expect(shouldBlur(true, true, false)).toBe(true);
    });
  });

  describe('blur decision matrix', () => {
    const scenarios = [
      { isModerated: false, isBlurred: false, isBlurDisabledGlobally: false, expected: false, desc: 'not moderated' },
      {
        isModerated: false,
        isBlurred: false,
        isBlurDisabledGlobally: true,
        expected: false,
        desc: 'not moderated, blur disabled',
      },
      {
        isModerated: false,
        isBlurred: true,
        isBlurDisabledGlobally: false,
        expected: false,
        desc: 'not moderated, would be blurred',
      },
      {
        isModerated: false,
        isBlurred: true,
        isBlurDisabledGlobally: true,
        expected: false,
        desc: 'not moderated, would be blurred, blur disabled',
      },
      {
        isModerated: true,
        isBlurred: false,
        isBlurDisabledGlobally: false,
        expected: false,
        desc: 'moderated but user unblurred',
      },
      {
        isModerated: true,
        isBlurred: false,
        isBlurDisabledGlobally: true,
        expected: false,
        desc: 'moderated but user unblurred, blur disabled',
      },
      {
        isModerated: true,
        isBlurred: true,
        isBlurDisabledGlobally: false,
        expected: true,
        desc: 'moderated and blurred - SHOULD BLUR',
      },
      {
        isModerated: true,
        isBlurred: true,
        isBlurDisabledGlobally: true,
        expected: false,
        desc: 'moderated and blurred but blur disabled',
      },
    ];

    scenarios.forEach(({ isModerated, isBlurred, isBlurDisabledGlobally, expected, desc }) => {
      it(`should return ${expected} when ${desc}`, () => {
        expect(shouldBlur(isModerated, isBlurred, isBlurDisabledGlobally)).toBe(expected);
      });
    });
  });
});
