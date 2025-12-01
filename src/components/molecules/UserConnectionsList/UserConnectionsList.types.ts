import type { Pubky } from '@/core';
import type { UserConnectionData } from '@/hooks/useProfileConnections';

export interface UserConnectionsListProps {
  connections: UserConnectionData[];
  onFollow?: (userId: Pubky, isCurrentlyFollowing: boolean) => void;
}
