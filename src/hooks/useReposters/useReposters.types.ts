export interface ReposterInfo {
  /** Composite post ID of the repost */
  repostId: string;
  /** Author ID of the person who reposted */
  authorId: string;
}

export interface UseRepostersResult {
  /** List of unique reposters (author IDs) */
  reposterIds: string[];
  /** Full list of repost info including repost IDs */
  reposters: ReposterInfo[];
  /** Total count of reposts */
  totalCount: number;
  /** Loading state */
  isLoading: boolean;
}
