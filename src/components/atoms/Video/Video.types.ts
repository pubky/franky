import type { VideoHTMLAttributes } from 'react';

export interface VideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  /**
   * The source URL of the video
   */
  src: string;

  /**
   * Optional poster image URL to display before the video plays
   */
  poster?: string;

  /**
   * Whether the video should start playing automatically
   * @default false
   */
  autoPlay?: boolean;

  /**
   * Whether the video should loop continuously
   * @default false
   */
  loop?: boolean;

  /**
   * Whether the video should be muted
   * @default false
   */
  muted?: boolean;

  /**
   * Whether to show native video controls
   * @default true
   */
  controls?: boolean;

  /**
   * How the video should be preloaded
   * @default 'metadata'
   */
  preload?: 'none' | 'metadata' | 'auto';

  /**
   * Whether the video should play inline on mobile devices
   * @default true
   */
  playsInline?: boolean;

  /**
   * Optional test ID for testing purposes
   */
  'data-testid'?: string;

  /**
   * When true, pauses the video if it's currently playing
   * @default false
   */
  pauseVideo?: boolean;
}
