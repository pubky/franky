export interface PostParticipant {
  id: string;
  name?: string;
  image?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  counts?: {
    tags: number;
    posts: number;
  };
}

export interface UsePostParticipantsOptions {
  /** Maximum number of participants to fetch (default: 10) */
  limit?: number;
}

export interface UsePostParticipantsResult {
  /** Array of participants (author + reply authors) */
  participants: PostParticipant[];
  /** The post author */
  author: PostParticipant | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}
