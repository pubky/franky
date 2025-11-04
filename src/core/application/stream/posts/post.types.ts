import * as Core from '@/core';

export type TInitialStreamParams = {
    streamId: Core.PostStreamTypes, 
    limit: number, 
    cachedStream: { stream: string[] } | null
};