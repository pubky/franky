export type Timestamp = number;
export type SyncStatus = 'local' | 'homeserver' | 'nexus';

// A Pubky identifier in z32 string format
export type Pubky = string;

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

