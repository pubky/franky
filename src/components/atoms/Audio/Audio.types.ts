import type { AudioHTMLAttributes } from 'react';

export interface AudioProps extends AudioHTMLAttributes<HTMLAudioElement> {
  /**
   * The source URL of the audio
   */
  src: string;

  /**
   * Whether the audio should start playing automatically
   * @default false
   */
  autoPlay?: boolean;

  /**
   * Whether the audio should loop continuously
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the audio should be muted
   * @default false
   */
  muted?: boolean;

  /**
   * Whether to show native audio controls
   * @default true
   */
  controls?: boolean;

  /**
   * How the audio should be preloaded
   * @default 'metadata'
   */
  preload?: 'none' | 'metadata' | 'auto';

  /**
   * Optional test ID for testing purposes
   */
  'data-testid'?: string;
}
