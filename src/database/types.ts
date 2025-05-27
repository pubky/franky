// Primary keys for database entities
export type UserPK = string; // User's public key
export type PostPK = `${UserPK}:${string}`; // Format: userPK:postIdentifier

// Timestamp type used across the database
export type Timestamp = number;

// Sync status for database entities
export type SyncStatus = 'local' | 'homeserver' | 'nexus';

export type HomeserverActions = 'PUT' | 'DEL';
