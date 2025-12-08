export interface UseRepostTextResult {
  /** Formatted repost text (e.g., "You reposted", "John and 14 others reposted this") */
  repostText: string;
  /** Whether the text is still loading */
  isLoading: boolean;
}
