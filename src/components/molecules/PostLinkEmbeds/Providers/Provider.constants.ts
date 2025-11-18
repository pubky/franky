/**
 * Common props for video embed iframes
 * Shared across video providers (YouTube, Vimeo, Twitch, etc.)
 */
export const VIDEO_EMBED_PROPS = {
  /**
   * Permissions for video embed features
   * - accelerometer: Device orientation
   * - autoplay: Auto-play videos
   * - clipboard-write: Copy to clipboard
   * - encrypted-media: DRM content
   * - gyroscope: Device motion
   * - picture-in-picture: PiP mode
   * - web-share: Native sharing
   */
  allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',

  /**
   * Sandbox restrictions for security
   * - allow-scripts: Required for video players
   * - allow-same-origin: Required for API access
   * - allow-presentation: Fullscreen/presentation mode
   * - allow-popups: Player controls that open new windows
   */
  sandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups',
} as const;
