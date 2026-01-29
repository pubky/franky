import { describe, it, expect } from 'vitest';
import { filterSuggestions } from './useTagInput.utils';
import { TAG_INPUT_MAX_SUGGESTIONS } from './useTagInput.constants';

describe('filterSuggestions', () => {
  const tags = [
    { label: 'bitcoin' },
    { label: 'btc' },
    { label: 'lightning' },
    { label: 'satoshi' },
    { label: 'hodl' },
    { label: 'sats' },
    { label: 'nostr' },
  ];

  it('returns empty array for empty input', () => {
    expect(filterSuggestions(tags, '')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(filterSuggestions(tags, '   ')).toEqual([]);
  });

  it('filters tags that contain the input text (case-insensitive)', () => {
    const result = filterSuggestions(tags, 'bit');
    expect(result).toEqual([{ label: 'bitcoin' }]);
  });

  it('excludes exact matches', () => {
    const result = filterSuggestions(tags, 'bitcoin');
    expect(result).toEqual([]);
  });

  it('is case-insensitive', () => {
    const result = filterSuggestions(tags, 'BIT');
    expect(result).toEqual([{ label: 'bitcoin' }]);
  });

  it('matches substrings anywhere in the tag', () => {
    const result = filterSuggestions(tags, 'sat');
    expect(result).toEqual([{ label: 'satoshi' }, { label: 'sats' }]);
  });

  it('trims input before matching', () => {
    const result = filterSuggestions(tags, '  bit  ');
    expect(result).toEqual([{ label: 'bitcoin' }]);
  });

  it('limits results to maxResults parameter', () => {
    const result = filterSuggestions(tags, 's', 2);
    expect(result.length).toBe(2);
  });

  it('limits results to TAG_INPUT_MAX_SUGGESTIONS by default', () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => ({ label: `tag${i}` }));
    const result = filterSuggestions(manyTags, 'tag');
    expect(result.length).toBe(TAG_INPUT_MAX_SUGGESTIONS);
  });

  it('returns all matches if fewer than maxResults', () => {
    const result = filterSuggestions(tags, 'light');
    expect(result).toEqual([{ label: 'lightning' }]);
  });

  it('returns empty array when no tags match', () => {
    const result = filterSuggestions(tags, 'xyz');
    expect(result).toEqual([]);
  });

  it('returns empty array for empty tags array', () => {
    const result = filterSuggestions([], 'bit');
    expect(result).toEqual([]);
  });

  it('preserves additional properties on tag objects', () => {
    const tagsWithExtra = [
      { label: 'bitcoin', count: 100 },
      { label: 'btcpay', count: 50 },
    ];
    const result = filterSuggestions(tagsWithExtra, 'btc');
    expect(result).toEqual([{ label: 'btcpay', count: 50 }]);
  });
});
