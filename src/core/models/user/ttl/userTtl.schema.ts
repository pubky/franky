import * as Core from '@/core';
import { TtlModelSchema } from '@/core/models/shared';

export interface UserTtlModelSchema extends TtlModelSchema<Core.Pubky> {
  id: Core.Pubky;
}

// Primary and compound indexes for Dexie
export const userTtlTableSchema = `
  &id,
  ttl
`;
