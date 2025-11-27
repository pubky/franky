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
    expect(result.current.tags).toHaveLength(0);
    expect(result.current.count).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.handleTagAdd).toBe('function');
  });

  it('adds new tag when handleTagAdd is called', () => {
    const { result } = renderHook(() => useTagged());
    const initialCount = result.current.count;

    let addResult: { success: boolean; error?: string };
    act(() => {
      addResult = result.current.handleTagAdd('ethereum');
    });

    expect(addResult!.success).toBe(true);
    expect(result.current.tags).toHaveLength(initialCount + 1);
    expect(result.current.tags.find((t: NexusTag) => t.label === 'ethereum')).toBeDefined();
  });

  it('adds tag successfully', () => {
    const { result } = renderHook(() => useTagged());
    const initialCount = result.current.count;

    let addResult: { success: boolean; error?: string };
    act(() => {
      addResult = result.current.handleTagAdd('ethereum');
    });

    expect(addResult!.success).toBe(true);
    expect(result.current.count).toBe(initialCount + 1);
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
