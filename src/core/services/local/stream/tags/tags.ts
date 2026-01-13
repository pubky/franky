import * as Core from '@/core';

export class LocalStreamTagsService {
  private constructor() {}

  static async upsert(streamId: Core.TagStreamTypes, stream: Core.NexusHotTag[]): Promise<void> {
    await Core.TagStreamModel.upsert(streamId, stream);
  }
}
