import { TtlModelSchema } from '@/core/models/shared';

export type PostTtlModelSchema = TtlModelSchema<string>;

// Primary and compound indexes for Dexie
export const postTtlTableSchema = `
  &id,
  lastUpdatedAt
`;
