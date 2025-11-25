import { PaginationParams } from '@/core';

export const DEFAULT_PAGINATION: PaginationParams = {
  skip: 0,
  limit: 10,
};

export const COMPOSITE_ID_DELIMITER = ':' as const;
