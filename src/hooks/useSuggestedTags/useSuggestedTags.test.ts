import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSuggestedTags } from './useSuggestedTags';
import * as Core from '@/core';

// Mock the SearchController
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    SearchController: {
      getTagsByPrefix: vi.fn(),
    },
  };
});

describe('useSuggestedTags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty suggestions initially', () => {
    const { result } = renderHook(() =>
      useSuggestedTags({
        tagInput: '',
        onTagSelect: vi.fn(),
      }),
    );

    expect(result.current.suggestedTags).toEqual([]);
    expect(result.current.selectedIndex).toBeNull();
    expect(result.current.isSearching).toBe(false);
  });

  it('should fetch suggestions after debounce', async () => {
    const mockTags = ['bitcoin', 'bitfinex', 'bitmex'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10, // Very short debounce for tests
        }),
      { initialProps: { tagInput: '' } },
    );

    // Update input
    rerender({ tagInput: 'bit' });

    // Wait for debounce and API call
    await waitFor(() => {
      expect(Core.SearchController.getTagsByPrefix).toHaveBeenCalledWith({
        prefix: 'bit',
        skip: 0,
        limit: 5,
      });
    });

    await waitFor(() => {
      expect(result.current.suggestedTags).toEqual(mockTags);
    });
  });

  it('should filter out exact matches from suggestions', async () => {
    const mockTags = ['bitcoin', 'bitcoincash'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bitcoin' });

    await waitFor(() => {
      // 'bitcoin' should be filtered out since it's an exact match
      expect(result.current.suggestedTags).toEqual(['bitcoincash']);
    });
  });

  it('should call onTagSelect when tag is clicked', async () => {
    const mockTags = ['bitcoin'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);
    const onTagSelect = vi.fn();

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect,
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(result.current.suggestedTags).toEqual(mockTags);
    });

    act(() => {
      result.current.handleTagClick('bitcoin');
    });

    expect(onTagSelect).toHaveBeenCalledWith('bitcoin');
  });

  it('should clear suggestions after selection', async () => {
    const mockTags = ['bitcoin'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(result.current.suggestedTags).toEqual(mockTags);
    });

    act(() => {
      result.current.handleTagClick('bitcoin');
    });

    expect(result.current.suggestedTags).toEqual([]);
  });

  it('should clear suggestions when clearSuggestions is called', async () => {
    const mockTags = ['bitcoin'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(result.current.suggestedTags).toEqual(mockTags);
    });

    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestedTags).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(Core.SearchController.getTagsByPrefix).mockRejectedValue(new Error('API error'));

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(result.current.isSearching).toBe(false);
    });

    expect(result.current.suggestedTags).toEqual([]);
  });

  it('should not search for empty input', () => {
    renderHook(() =>
      useSuggestedTags({
        tagInput: '   ',
        onTagSelect: vi.fn(),
        debounceMs: 10,
      }),
    );

    // Empty/whitespace input should not trigger search
    expect(Core.SearchController.getTagsByPrefix).not.toHaveBeenCalled();
  });

  it('should respect custom limit', async () => {
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
          limit: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(Core.SearchController.getTagsByPrefix).toHaveBeenCalledWith({
        prefix: 'bit',
        skip: 0,
        limit: 10,
      });
    });
  });

  it('should lock search after selection until input changes', async () => {
    const mockTags = ['bitcoin', 'bitfinex'];
    vi.mocked(Core.SearchController.getTagsByPrefix).mockResolvedValue(mockTags);

    const { result, rerender } = renderHook(
      ({ tagInput }) =>
        useSuggestedTags({
          tagInput,
          onTagSelect: vi.fn(),
          debounceMs: 10,
        }),
      { initialProps: { tagInput: '' } },
    );

    // Trigger search
    rerender({ tagInput: 'bit' });

    await waitFor(() => {
      expect(result.current.suggestedTags).toEqual(mockTags);
    });

    // Select a tag - this should lock search and clear suggestions
    act(() => {
      result.current.handleTagClick('bitcoin');
    });

    expect(result.current.suggestedTags).toEqual([]);

    // Change input to something different - should unlock and trigger new search
    vi.mocked(Core.SearchController.getTagsByPrefix).mockClear();
    rerender({ tagInput: 'eth' });

    await waitFor(() => {
      expect(Core.SearchController.getTagsByPrefix).toHaveBeenCalledWith({
        prefix: 'eth',
        skip: 0,
        limit: 5,
      });
    });
  });
});
