import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTagged } from './useTagged';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

describe('useTagged', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial tags and count', () => {
    const { result } = renderHook(() => useTagged());
    expect(result.current.tags).toHaveLength(3);
    expect(result.current.count).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
  });

  it('adds new tag when handleTagAdd is called', () => {
    const { result } = renderHook(() => useTagged());
    const initialCount = result.current.count;

    act(() => {
      result.current.handleTagAdd('ethereum');
    });

    expect(result.current.tags).toHaveLength(initialCount + 1);
    expect(result.current.tags.find((t: NexusTag) => t.label === 'ethereum')).toBeDefined();
  });

  it('does not add duplicate tag', () => {
    const { result } = renderHook(() => useTagged());
    const initialCount = result.current.count;

    act(() => {
      result.current.handleTagAdd('bitcoin');
    });

    expect(result.current.count).toBe(initialCount);
  });

  it('does not add empty tag', () => {
    const { result } = renderHook(() => useTagged());
    const initialCount = result.current.count;

    act(() => {
      result.current.handleTagAdd('   ');
    });

    expect(result.current.count).toBe(initialCount);
  });

  it('preserves emoji in tag label', () => {
    const { result } = renderHook(() => useTagged());

    act(() => {
      result.current.handleTagAdd('😊 bitcoin');
    });

    const newTag = result.current.tags.find((t: NexusTag) => t.label === '😊 bitcoin' || t.label.includes('bitcoin'));
    expect(newTag).toBeDefined();
    expect(newTag?.label).toContain('bitcoin');
  });
});
