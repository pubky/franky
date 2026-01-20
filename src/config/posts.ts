import { getValidMimeTypes } from 'pubky-app-specs';

/**
 * Post-related configuration constants
 */

/** Maximum number of tags allowed per post */
export const POST_MAX_TAGS = 5;

/** Maximum character length for post content */
export const POST_MAX_CHARACTER_LENGTH = 2000;

/** Maximum character length for article title */
export const ARTICLE_TITLE_MAX_CHARACTER_LENGTH = 100;

/** Maximum character length for article content (22 characters reserved for JSON string) */
export const ARTICLE_MAX_CHARACTER_LENGTH = 50000 - ARTICLE_TITLE_MAX_CHARACTER_LENGTH - 22;

/** Maximum character length for a tag */
export const TAG_MAX_LENGTH = 20;

/** Maximum character length for feedback comments */
export const FEEDBACK_MAX_CHARACTER_LENGTH = 1000;

/** Public key length displayed in post headers */
export const POST_HEADER_PUBLIC_KEY_LENGTH = 8;

/**
 * Supported MIME types for file attachments.
 * Imported directly from pubky-app-specs to ensure consistency.
 */
export const POST_SUPPORTED_ATTACHMENT_MIME_TYPES = getValidMimeTypes() as string[];

export const ARTICLE_SUPPORTED_ATTACHMENT_MIME_TYPES = getValidMimeTypes().filter((t) =>
  t.startsWith('image/'),
) as string[];

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

/** Human-readable list of supported file types for error messages (derived from MIME types) */
export const POST_SUPPORTED_FILE_TYPES = POST_SUPPORTED_ATTACHMENT_MIME_TYPES.map((mime) => mime.split('/')[1]).join(
  ', ',
);

export const ARTICLE_SUPPORTED_FILE_TYPES = ARTICLE_SUPPORTED_ATTACHMENT_MIME_TYPES.map(
  (mime) => mime.split('/')[1],
).join(', ');
