import * as Core from '@/core';

export function buildUrls(fileCompositeId: string): Core.NexusFileUrls {
  const path = fileCompositeId.replaceAll(':', '/');
  return {
    main: `${path}/main`,
    feed: `${path}/feed`,
    small: `${path}/small`,
  };
}
