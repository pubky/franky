import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalStreamTagsService {
  private constructor() {}

  static async upsert(streamId: Core.TagStreamTypes, stream: Core.NexusHotTag[]): Promise<void> {
    try {
      await Core.TagStreamModel.upsert(streamId, stream);
    } catch (error) {
      Libs.Logger.error('Failed to upsert tag stream', { streamId, error });
      throw error;
    }
  }
}
