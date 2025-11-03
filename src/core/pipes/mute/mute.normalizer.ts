import { MuteResult } from 'pubky-app-specs';
import * as Core from '@/core';

export class MuteNormalizer {
  private constructor() {}

  static async to({ muter, mutee }: Core.TMuteParams): Promise<MuteResult> {
    const builder = Core.PubkySpecsSingleton.get(muter);
    return builder.createMute(mutee);
  }
}
