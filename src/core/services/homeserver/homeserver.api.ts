import * as Core from '@/core';
import { LastReadResult } from 'pubky-app-specs';

export const homeserverApi = {
  lastRead: (pubky: Core.Pubky): LastReadResult => {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    return builder.createLastRead();
  },
};
