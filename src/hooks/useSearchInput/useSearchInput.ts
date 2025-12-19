import { useState, useRef, useEffect, useCallback } from 'react';
import type { UseSearchInputParams, UseSearchInputResult } from './useSearchInput.types';

/**
 * useSearchInput
 *
 * Hook for managing search input state and behavior.
 * Handles input value, focus state, click outside, and keyboard events.
 */
export function useSearchInput({ defaultExpanded = false }: UseSearchInputParams = {}): UseSearchInputResult {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(defaultExpanded);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // TODO: implement search navigation
        console.log('Search:', inputValue);
      }
      if (e.key === 'Escape') setIsFocused(false);
    },
    [inputValue],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setInputValue(tag);
    // TODO: implement search navigation
    console.log('Search tag:', tag);
    setIsFocused(false);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFocused]);

  return {
    inputValue,
    isFocused,
    containerRef,
    handleInputChange,
    handleKeyDown,
    handleFocus,
    handleTagClick,
  };
}
