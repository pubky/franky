import * as Core from '@/core';
import * as Libs from '@/libs';

export class LocalHotService {
  private constructor() {}

  static async upsert(streamId: string, stream: Core.NexusHotTag[]): Promise<void> {
    try {
      await Core.TagStreamModel.upsert(streamId as Core.TagStreamTypes, stream);
    } catch (error) {
      Libs.Logger.error('Failed to upsert hot tag stream', { streamId, error });
      throw error;
    }
  }

  static async findById(streamId: string): Promise<{ stream: Core.NexusHotTag[] } | null> {
    try {
      return await Core.TagStreamModel.findById(streamId as Core.TagStreamTypes);
    } catch (error) {
      Libs.Logger.error('Failed to find hot tag stream by id', { streamId, error });
      throw error;
    }
  }

  static async deleteById(streamId: string): Promise<void> {
    try {
      await Core.TagStreamModel.deleteById(streamId as Core.TagStreamTypes);
      Libs.Logger.info('Hot tag stream cleared', { streamId });
    } catch (error) {
      Libs.Logger.error('Failed to clear hot tag stream', { streamId, error });
      throw error;
    }
  }
}
