// =============================================================================
// Function Parameter Types
// =============================================================================

export interface ExtractInitialsProps {
  /** The name to extract initials from */
  name: string;
  /** Maximum number of initials to return (default: 2) */
  maxLength?: number;
}

export interface CopyToClipboardProps {
  /** The text to copy to clipboard */
  text: string;
}

export interface FormatPublicKeyProps {
  /** The public key to format */
  key: string;
  /** The length to truncate to */
  length: number;
  /** Whether to include the pubky prefix in the formatted output */
  includePrefix?: boolean;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Options for getDisplayTags function
 */
export interface GetDisplayTagsOptions {
  /** Maximum characters per tag before truncation (default: 10) */
  maxTagLength?: number;
  /** Maximum total characters across all displayed tags (default: 24) */
  maxTotalChars?: number;
  /** Maximum number of tags to display (default: 3) */
  maxCount?: number;
}
