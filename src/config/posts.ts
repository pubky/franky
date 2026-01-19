/**
 * Post-related configuration constants
 */

/** Maximum number of tags allowed per post */
export const POST_MAX_TAGS = 5;

/** Maximum character length for post content */
export const POST_MAX_CHARACTER_LENGTH = 2000;

/** Maximum character length for article content */
export const ARTICLE_MAX_CHARACTER_LENGTH = 50000;

/** Maximum character length for article title */
export const ARTICLE_TITLE_MAX_CHARACTER_LENGTH = 100;

/** Maximum character length for a tag */
export const TAG_MAX_LENGTH = 20;

/** Maximum character length for feedback comments */
export const FEEDBACK_MAX_CHARACTER_LENGTH = 1000;

/** Public key length displayed in post headers */
export const POST_HEADER_PUBLIC_KEY_LENGTH = 8;

/**
 * Supported MIME types for file attachments.
 * These must match the valid MIME types defined in pubky-app-specs.
 * @see https://github.com/pubky/pubky-app-specs/blob/main/src/models/file.rs
 */
export const POST_SUPPORTED_ATTACHMENT_MIME_TYPES = [
  // Images
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  // Audio
  'audio/mpeg', // .mp3
  'audio/wav', // .wav
  // Video
  'video/mp4', // .mp4
  'video/mpeg', // .mpeg
  // Documents
  'application/pdf',
] as const;

export const ARTICLE_SUPPORTED_ATTACHMENT_MIME_TYPES = [
  // Images
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
] as const;

/** File input accept attribute string for supported attachment types */
export const POST_ATTACHMENT_ACCEPT_STRING = POST_SUPPORTED_ATTACHMENT_MIME_TYPES.join(',');

export const ARTICLE_ATTACHMENT_ACCEPT_STRING = ARTICLE_SUPPORTED_ATTACHMENT_MIME_TYPES.join(',');

/** Maximum file size for images (5MB) */
export const ATTACHMENT_MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Maximum file size for non-image files (20MB) */
export const ATTACHMENT_MAX_OTHER_SIZE = 20 * 1024 * 1024;

/** Maximum number of attachments per post */
export const POST_ATTACHMENT_MAX_FILES = 4;

/** Maximum number of attachments per article */
export const ARTICLE_ATTACHMENT_MAX_FILES = 1;

/** Human-readable list of supported file extensions for error messages */
export const POST_SUPPORTED_FILE_EXTENSIONS = 'GIF, JPEG, PNG, SVG, WebP, MP3, WAV, MP4, MPEG, or PDF';

export const ARTICLE_SUPPORTED_FILE_EXTENSIONS = 'GIF, JPEG, PNG, SVG, WebP';
