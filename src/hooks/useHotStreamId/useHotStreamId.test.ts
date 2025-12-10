import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHotStreamId } from './useHotStreamId';
import * as Core from '@/core';

describe('useHotStreamId', () => {
  // Reset hot store before each test
  beforeEach(() => {
    const { result } = renderHook(() => Core.useHotStore((state) => state.reset));
    result.current();
  });

  it('should return engagement stream for all reach (default)', () => {
    const { result } = renderHook(() => useHotStreamId());

    expect(result.current).toBe(Core.PostStreamTypes.POPULARITY_ALL_ALL);
    expect(result.current).toBe('total_engagement:all:all');
  });

  it('should update when reach filter changes to following', () => {
    const { result: setReach } = renderHook(() => Core.useHotStore((state) => state.setReach));

    // Change to following
    setReach.current(Core.REACH.FOLLOWING);

    const { result } = renderHook(() => useHotStreamId());
    expect(result.current).toBe(Core.PostStreamTypes.POPULARITY_FOLLOWING_ALL);
    expect(result.current).toBe('total_engagement:following:all');
  });

  it('should update when reach filter changes to friends', () => {
    const { result: setReach } = renderHook(() => Core.useHotStore((state) => state.setReach));

    // Change to friends
    setReach.current(Core.REACH.FRIENDS);

    const { result } = renderHook(() => useHotStreamId());
    expect(result.current).toBe(Core.PostStreamTypes.POPULARITY_FRIENDS_ALL);
    expect(result.current).toBe('total_engagement:friends:all');
  });

  it('should handle all reach options', () => {
    const { result: setReach } = renderHook(() => Core.useHotStore((state) => state.setReach));

    const reachOptions = [
      { reach: Core.REACH.ALL, expected: Core.PostStreamTypes.POPULARITY_ALL_ALL },
      { reach: Core.REACH.FOLLOWING, expected: Core.PostStreamTypes.POPULARITY_FOLLOWING_ALL },
      { reach: Core.REACH.FRIENDS, expected: Core.PostStreamTypes.POPULARITY_FRIENDS_ALL },
    ];

    reachOptions.forEach(({ reach, expected }) => {
      setReach.current(reach);
      const { result } = renderHook(() => useHotStreamId());
      expect(result.current).toBe(expected);
    });
  });

  it('should always use engagement sorting regardless of timeframe', () => {
    const { result: hotStore } = renderHook(() => Core.useHotStore());

    // Set different timeframes - stream ID should always use engagement sorting
    hotStore.current.setTimeframe(Core.TIMEFRAME.TODAY);
    const { result: result1 } = renderHook(() => useHotStreamId());
    expect(result1.current).toContain('total_engagement');

    hotStore.current.setTimeframe(Core.TIMEFRAME.THIS_MONTH);
    const { result: result2 } = renderHook(() => useHotStreamId());
    expect(result2.current).toContain('total_engagement');

    hotStore.current.setTimeframe(Core.TIMEFRAME.ALL_TIME);
    const { result: result3 } = renderHook(() => useHotStreamId());
    expect(result3.current).toContain('total_engagement');
  });

  it('should always use all content types', () => {
    const { result: setReach } = renderHook(() => Core.useHotStore((state) => state.setReach));

    // For any reach, content should be 'all'
    setReach.current(Core.REACH.ALL);
    const { result: result1 } = renderHook(() => useHotStreamId());
    expect(result1.current).toMatch(/:all$/);

    setReach.current(Core.REACH.FOLLOWING);
    const { result: result2 } = renderHook(() => useHotStreamId());
    expect(result2.current).toMatch(/:all$/);
  });

  it('should reflect store state changes immediately', () => {
    const { result: streamIdResult, rerender } = renderHook(() => useHotStreamId());
    const { result: hotStore } = renderHook(() => Core.useHotStore());

    expect(streamIdResult.current).toBe('total_engagement:all:all');

    // Change filter through store
    hotStore.current.setReach(Core.REACH.FRIENDS);
    rerender();

    // Hook should reflect new state
    expect(streamIdResult.current).toBe('total_engagement:friends:all');
  });
});
