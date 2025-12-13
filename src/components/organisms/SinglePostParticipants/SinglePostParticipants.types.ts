import type * as Hooks from '@/hooks';

export interface SinglePostParticipantsProps {
  /** The composite post ID (format: authorId:postId) */
  postId: string;
  /** Optional className for the container */
  className?: string;
}

export interface ParticipantItemProps {
  /** Participant data */
  participant: Hooks.PostParticipant;
  /** Callback when user is clicked */
  onUserClick: (pubky: string) => void;
  /** Callback when follow button is clicked */
  onFollowClick: (userId: string, isFollowing: boolean) => Promise<void>;
  /** Function to check if a user's follow action is loading */
  isUserLoading: (userId: string) => boolean;
}
