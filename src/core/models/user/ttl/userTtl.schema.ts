import { Pubky } from '@/core';

export interface UserTtlModelSchema {
  id: Pubky;
  ttl: number;
}

export const userTtlTableSchema = `
    &id,
    ttl
`;
