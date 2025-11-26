/**
 * Type definitions for emoji-mart library
 *
 * These types are defined locally because:
 * - The official emoji-mart@5.6.0 types use `any` extensively
 * - Provides stricter type safety for our emoji picker implementation
 * - Follows the project's pattern of co-locating types with components
 *
 * @see https://github.com/missive/emoji-mart
 */

export interface EmojiData {
  native: string;
  unified?: string;
  shortcodes?: string;
  [key: string]: unknown;
}

export interface PickerOptions {
  data: unknown;
  theme?: 'light' | 'dark' | 'auto';
  onEmojiSelect?: (emoji: EmojiData) => void;
  parent?: HTMLElement;
  [key: string]: unknown;
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: { native: string }) => void;
  maxLength?: number;
  currentInput?: string;
}
