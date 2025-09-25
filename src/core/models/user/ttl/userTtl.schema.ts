import * as Core from '@/core';
import { TtlModelSchema } from '@/core/models/shared';

export type UserTtlModelSchema = TtlModelSchema<Core.Pubky>;

// Primary and compound indexes for Dexie
export const userTtlTableSchema = `
  &id,
  ttl
`;
