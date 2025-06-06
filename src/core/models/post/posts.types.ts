import { NexusPostCounts, NexusPostDetails, NexusPostRelationships, NexusTag } from '@/core/services/nexus/nexus.types';

export type PostPK = string; // TODO: userPK:postIdentifier
export type PostCounts = NexusPostCounts;
export type PostTag = NexusTag;
export type PostRelationships = NexusPostRelationships;
export type PostDetails = NexusPostDetails;
