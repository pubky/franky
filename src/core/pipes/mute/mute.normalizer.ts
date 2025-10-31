import { MuteResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class MuteNormalizer {
  private constructor() {}

  static to({ muter, mutee }: Core.TMuteParams): MuteResult {
    const builder = Core.PubkySpecsSingleton.get(muter);
    const result = builder.createMute(mutee);
    Libs.Logger.debug('Mute validated', { result });
    return result;
  }
}
