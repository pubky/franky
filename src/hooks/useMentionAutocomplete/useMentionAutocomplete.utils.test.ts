import { describe, it, expect } from 'vitest';
import { extractMentionQuery, getContentWithMention } from './useMentionAutocomplete.utils';

describe('extractMentionQuery', () => {
  describe('@ pattern extraction', () => {
    it('returns null atQuery for content without @ pattern at end', () => {
      const result = extractMentionQuery('Hello world');
      expect(result.atQuery).toBeNull();
    });

    it('returns null atQuery when @ has no characters after it', () => {
      const result = extractMentionQuery('Hello @');
      expect(result.atQuery).toBeNull();
    });

    it('returns null atQuery when @ has only 1 character (below minimum)', () => {
      const result = extractMentionQuery('Hello @a');
      expect(result.atQuery).toBeNull();
    });

    it('extracts @ query with exactly 2 characters (minimum)', () => {
      const result = extractMentionQuery('Hello @ab');
      expect(result.atQuery).toBe('ab');
    });

    it('extracts @ query with more than 2 characters', () => {
      const result = extractMentionQuery('Hello @john');
      expect(result.atQuery).toBe('john');
    });

    it('only extracts the @ query at the end', () => {
      const result = extractMentionQuery('Hello @alice and @bob');
      expect(result.atQuery).toBe('bob');
    });

    it('handles @ at the start of content', () => {
      const result = extractMentionQuery('@john');
      expect(result.atQuery).toBe('john');
    });

    it('returns null when @ pattern is not at the end', () => {
      const result = extractMentionQuery('@john is here');
      expect(result.atQuery).toBeNull();
    });

    it('handles special characters in username', () => {
      const result = extractMentionQuery('Hello @john_doe-123');
      expect(result.atQuery).toBe('john_doe-123');
    });
  });

  describe('pk: pattern extraction', () => {
    it('returns null pkQuery for content without pk: pattern at end', () => {
      const result = extractMentionQuery('Hello world');
      expect(result.pkQuery).toBeNull();
    });

    it('returns null pkQuery when pk: has no characters after it', () => {
      const result = extractMentionQuery('Hello pk:');
      expect(result.pkQuery).toBeNull();
    });

    it('returns null pkQuery when pk: has only 1 character (below minimum)', () => {
      const result = extractMentionQuery('Hello pk:a');
      expect(result.pkQuery).toBeNull();
    });

    it('returns null pkQuery when pk: has only 2 characters (below minimum)', () => {
      const result = extractMentionQuery('Hello pk:ab');
      expect(result.pkQuery).toBeNull();
    });

    it('extracts pk: query with exactly 3 characters (minimum)', () => {
      const result = extractMentionQuery('Hello pk:abc');
      expect(result.pkQuery).toBe('abc');
    });

    it('extracts pk: query with more than 3 characters', () => {
      const result = extractMentionQuery('Hello pk:abc123');
      expect(result.pkQuery).toBe('abc123');
    });

    it('only extracts the pk: query at the end', () => {
      const result = extractMentionQuery('Hello pk:user1 and pk:user2');
      expect(result.pkQuery).toBe('user2');
    });

    it('handles pk: at the start of content', () => {
      const result = extractMentionQuery('pk:user123');
      expect(result.pkQuery).toBe('user123');
    });

    it('returns null when pk: pattern is not at the end', () => {
      const result = extractMentionQuery('pk:user123 is here');
      expect(result.pkQuery).toBeNull();
    });
  });

  describe('complete pubkey filtering', () => {
    const completePubkey = 'o1gg96ewuojmopcjbz8895478wenhuj8okomrf4w6f97puo18t7o';

    it('filters out complete pubkey (52 alphanumeric chars)', () => {
      const result = extractMentionQuery(`Hello pk:${completePubkey}`);
      expect(result.pkQuery).toBeNull();
    });

    it('filters out pubkey longer than 52 chars', () => {
      const longerPubkey = completePubkey + 'extra';
      const result = extractMentionQuery(`Hello pk:${longerPubkey}`);
      expect(result.pkQuery).toBeNull();
    });

    it('keeps partial pubkey (less than 52 chars)', () => {
      const partialPubkey = 'o1gg96ewuojm';
      const result = extractMentionQuery(`Hello pk:${partialPubkey}`);
      expect(result.pkQuery).toBe(partialPubkey);
    });

    it('keeps pubkey with non-alphanumeric characters even if 52+ chars', () => {
      // Contains uppercase - not a valid complete pubkey pattern
      const mixedCasePubkey = 'O1gg96ewuojmopcjbz8895478wenhuj8okomrf4w6f97puo18t7o';
      const result = extractMentionQuery(`Hello pk:${mixedCasePubkey}`);
      expect(result.pkQuery).toBe(mixedCasePubkey);
    });
  });

  describe('mixed @ and pk: patterns', () => {
    it('extracts only pk: when both present but only pk: is at absolute end', () => {
      // @john is NOT at the end - pk:user123 comes after it
      const result = extractMentionQuery('Hello @john pk:user123');
      expect(result.atQuery).toBeNull();
      expect(result.pkQuery).toBe('user123');
    });

    it('extracts only pk: when @ is not at end', () => {
      const result = extractMentionQuery('@alice hello pk:user1');
      expect(result.atQuery).toBeNull();
      expect(result.pkQuery).toBe('user1');
    });

    it('extracts only @ when pk: is not at end', () => {
      const result = extractMentionQuery('pk:user1 hello @bob');
      expect(result.atQuery).toBe('bob');
      expect(result.pkQuery).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for both on empty string', () => {
      const result = extractMentionQuery('');
      expect(result.atQuery).toBeNull();
      expect(result.pkQuery).toBeNull();
    });

    it('returns null for both on whitespace only', () => {
      const result = extractMentionQuery('   \n\t  ');
      expect(result.atQuery).toBeNull();
      expect(result.pkQuery).toBeNull();
    });

    it('handles @ in email-like pattern at end', () => {
      const result = extractMentionQuery('contact email@example.com');
      // @example.com is at the end
      expect(result.atQuery).toBe('example.com');
    });
  });
});

describe('getContentWithMention', () => {
  const userId = 'abc123xyz';

  describe('replaces @ pattern at end', () => {
    it('replaces @username with pk:userId', () => {
      const result = getContentWithMention('Hello @john', userId);
      expect(result).toBe(`Hello pk:${userId} `);
    });

    it('replaces partial @username with pk:userId', () => {
      const result = getContentWithMention('Hello @jo', userId);
      expect(result).toBe(`Hello pk:${userId} `);
    });

    it('replaces @ alone with pk:userId', () => {
      const result = getContentWithMention('Hello @', userId);
      expect(result).toBe(`Hello pk:${userId} `);
    });

    it('only replaces the @ pattern at the end', () => {
      const result = getContentWithMention('@alice mentioned @bob', userId);
      expect(result).toBe(`@alice mentioned pk:${userId} `);
    });
  });

  describe('replaces pk: pattern at end', () => {
    it('replaces pk:partial with pk:userId', () => {
      const result = getContentWithMention('Hello pk:abc', userId);
      expect(result).toBe(`Hello pk:${userId} `);
    });

    it('replaces pk: alone with pk:userId', () => {
      const result = getContentWithMention('Hello pk:', userId);
      expect(result).toBe(`Hello pk:${userId} `);
    });

    it('only replaces the pk: pattern at the end', () => {
      const result = getContentWithMention('pk:user1 mentioned pk:user', userId);
      expect(result).toBe(`pk:user1 mentioned pk:${userId} `);
    });
  });

  describe('pk: takes precedence over @', () => {
    it('replaces pk: when both patterns present at end', () => {
      // pk: pattern is checked first
      const result = getContentWithMention('@john pk:abc', userId);
      expect(result).toBe(`@john pk:${userId} `);
    });
  });

  describe('fallback appends when no pattern at end', () => {
    it('appends pk:userId when content has no mention pattern at end', () => {
      const result = getContentWithMention('Hello world', userId);
      expect(result).toBe(`Hello world pk:${userId} `);
    });

    it('appends pk:userId to empty content', () => {
      const result = getContentWithMention('', userId);
      expect(result).toBe(`pk:${userId} `);
    });

    it('appends when @ pattern is not at the end', () => {
      const result = getContentWithMention('@john is cool', userId);
      expect(result).toBe(`@john is cool pk:${userId} `);
    });
  });

  describe('adds trailing space', () => {
    it('always adds a trailing space after the mention', () => {
      const result = getContentWithMention('Hello @test', userId);
      expect(result.endsWith(' ')).toBe(true);
    });
  });
});
