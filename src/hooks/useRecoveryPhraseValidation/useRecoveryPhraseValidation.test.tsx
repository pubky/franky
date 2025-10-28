import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecoveryPhraseValidation } from './useRecoveryPhraseValidation';

describe('useRecoveryPhraseValidation', () => {
  const mockRecoveryWords = [
    'tube',
    'tube',
    'resource',
    'mass',
    'door',
    'firm',
    'genius',
    'parrot',
    'girl',
    'orphan',
    'window',
    'world',
  ];

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    expect(result.current.userWords).toEqual(Array(12).fill(''));
    expect(result.current.errors).toEqual(Array(12).fill(false));
    expect(result.current.usedWordInstances.size).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.availableWords).toEqual([...mockRecoveryWords].sort());
  });

  it('should handle word click correctly', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    act(() => {
      result.current.handleWordClick('tube', 0);
    });

    expect(result.current.userWords[0]).toBe('tube');
    expect(result.current.usedWordInstances.has(0)).toBe(true);
    expect(result.current.isComplete).toBe(false);
  });

  it('should handle duplicate words correctly', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    // Click first tube instance
    act(() => {
      result.current.handleWordClick('tube', 0);
    });

    expect(result.current.userWords[0]).toBe('tube');
    expect(result.current.usedWordInstances.has(0)).toBe(true);
    expect(result.current.usedWordInstances.has(1)).toBe(false);

    // Click second tube instance
    act(() => {
      result.current.handleWordClick('tube', 1);
    });

    expect(result.current.userWords[1]).toBe('tube');
    expect(result.current.usedWordInstances.has(0)).toBe(true);
    expect(result.current.usedWordInstances.has(1)).toBe(true);
  });

  it('should prevent clicking already used word instances', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    act(() => {
      result.current.handleWordClick('tube', 0);
    });

    // Try to click the same instance again
    act(() => {
      result.current.handleWordClick('tube', 0);
    });

    // Should still only have one word filled
    expect(result.current.userWords.filter((word) => word === 'tube')).toHaveLength(1);
  });

  it('should clear words correctly', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    act(() => {
      result.current.handleWordClick('tube', 0);
    });

    expect(result.current.userWords[0]).toBe('tube');
    expect(result.current.usedWordInstances.has(0)).toBe(true);

    act(() => {
      result.current.clearWord(0);
    });

    expect(result.current.userWords[0]).toBe('');
    expect(result.current.usedWordInstances.has(0)).toBe(false);
  });

  it('should validate words correctly', async () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    // Fill slots with correct words one by one
    await act(async () => {
      // Fill first slot with correct word
      const tubeIndex = result.current.availableWords.indexOf('tube');
      result.current.handleWordClick('tube', tubeIndex);
    });

    await act(async () => {
      // Fill second slot with correct word (second tube)
      const tubeIndex2 = result.current.availableWords.lastIndexOf('tube');
      result.current.handleWordClick('tube', tubeIndex2);
    });

    await act(async () => {
      // Fill third slot with correct word
      const resourceIndex = result.current.availableWords.indexOf('resource');
      result.current.handleWordClick('resource', resourceIndex);
    });

    // Check that we have some words filled
    expect(result.current.userWords[0]).toBe('tube');
    expect(result.current.userWords[1]).toBe('tube');
    expect(result.current.userWords[2]).toBe('resource');

    // Test validation
    await act(async () => {
      const isValid = result.current.validateWords();
      expect(isValid).toBe(false); // Not all slots filled yet
    });
  });

  it('should detect errors for wrong words', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    // Click wrong word for first slot
    act(() => {
      const doorIndex = result.current.availableWords.indexOf('door');
      result.current.handleWordClick('door', doorIndex);
    });

    expect(result.current.userWords[0]).toBe('door');
    expect(result.current.errors[0]).toBe(true);
    expect(result.current.isComplete).toBe(false);
  });

  it('should handle identical words correctly', () => {
    const identicalWords = Array(12).fill('bacon');
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: identicalWords }));

    // Click first few bacon instances - they should fill slots 0, 1, 2
    act(() => {
      result.current.handleWordClick('bacon', 0);
    });

    act(() => {
      result.current.handleWordClick('bacon', 1);
    });

    act(() => {
      result.current.handleWordClick('bacon', 2);
    });

    expect(result.current.userWords[0]).toBe('bacon');
    expect(result.current.userWords[1]).toBe('bacon');
    expect(result.current.userWords[2]).toBe('bacon');
    expect(result.current.usedWordInstances.has(0)).toBe(true);
    expect(result.current.usedWordInstances.has(1)).toBe(true);
    expect(result.current.usedWordInstances.has(2)).toBe(true);

    // Clear first slot
    act(() => {
      result.current.clearWord(0);
    });

    expect(result.current.userWords[0]).toBe('');
    expect(result.current.usedWordInstances.has(0)).toBe(false);
    expect(result.current.usedWordInstances.has(1)).toBe(true);
    expect(result.current.usedWordInstances.has(2)).toBe(true);
  });

  it('should compute word count map correctly', () => {
    const { result } = renderHook(() => useRecoveryPhraseValidation({ recoveryWords: mockRecoveryWords }));

    expect(result.current.wordCountMap['tube']).toBe(2);
    expect(result.current.wordCountMap['resource']).toBe(1);
    expect(result.current.wordCountMap['nonexistent']).toBeUndefined();
  });
});
