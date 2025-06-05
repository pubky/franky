export type Timestamp = number;
export type SyncStatus = 'local' | 'homeserver' | 'nexus';
export interface PaginationParams {
  skip?: number;
  limit?: number;
}
