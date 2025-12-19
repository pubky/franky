import { RefObject } from 'react';

export interface UseSearchInputParams {
  defaultExpanded?: boolean;
}

export interface UseSearchInputResult {
  inputValue: string;
  isFocused: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleFocus: () => void;
  handleTagClick: (tag: string) => void;
}
