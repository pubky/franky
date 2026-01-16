import { getValidMimeTypes } from 'pubky-app-specs';

/**
 * Post-related configuration constants
 */

/** Maximum number of tags allowed per post */
export const POST_MAX_TAGS = 5;

/** Maximum character length for post content */
export const POST_MAX_CHARACTER_LENGTH = 2000;

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
export const SUPPORTED_ATTACHMENT_MIME_TYPES = getValidMimeTypes() as string[];

/** File input accept attribute string for supported attachment types */
export const ATTACHMENT_ACCEPT_STRING = SUPPORTED_ATTACHMENT_MIME_TYPES.join(',');

/** Maximum file size for images (5MB) */
export const ATTACHMENT_MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** Maximum file size for non-image files (20MB) */
export const ATTACHMENT_MAX_OTHER_SIZE = 20 * 1024 * 1024;

/** Maximum number of attachments per post */
export const ATTACHMENT_MAX_FILES = 4;

/** Human-readable list of supported file types for error messages (derived from MIME types) */
export const SUPPORTED_FILE_TYPES = SUPPORTED_ATTACHMENT_MIME_TYPES.map((mime) => mime.split('/')[1]).join(', ');
