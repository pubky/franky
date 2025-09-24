import { TtlModelSchema } from '@/core/models/shared';

export interface PostTtlModelSchema extends TtlModelSchema<string> {
  id: string;
}

// Primary and compound indexes for Dexie
export const postTtlTableSchema = `
  &id,
  ttl
`;
