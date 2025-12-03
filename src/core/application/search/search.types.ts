import type { TPrefixSearchParams, TTagSearchParams, TTagHotParams } from '@/core/services/nexus';

export type TSearchUsersParams = TPrefixSearchParams;

export type TSearchTagsParams = TPrefixSearchParams;

export type TSearchPostsParams = TTagSearchParams;

export type THotTagsParams = TTagHotParams;
