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

/**
 * Standard 16:9 aspect ratio for video embeds
 * Used by all video providers for consistent rendering
 *
 * Implementation:
 * - Wrapper: `relative pt-[56.25%]` (56.25% = 9/16 * 100%)
 * - Iframe: `absolute top-0 left-0 h-full w-full` + `height="auto"`
 *
 * @example
 * ```tsx
 * <Container className="relative pt-[56.25%]">
 *   <Iframe className="absolute top-0 left-0 h-full w-full" height="auto" />
 * </Container>
 * ```
 *
 * Why 16:9?
 * - Industry standard for video content
 * - Prevents layout shift during load
 * - Consistent UX across providers
 * - Maintains aspect ratio on all screen sizes
 */
export const VIDEO_ASPECT_RATIO_16_9 = '56.25%' as const;
