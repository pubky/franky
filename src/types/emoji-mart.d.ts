declare module 'emoji-mart' {
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

  export class Picker {
    constructor(options: PickerOptions);
  }
}

declare module '@emoji-mart/data' {
  const data: unknown;
  export default data;
}
