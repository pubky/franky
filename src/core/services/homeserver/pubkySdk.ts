import { Pubky } from '@synonymdev/pubky';

import * as Config from '@/config';

const TESTNET = Config.TESTNET.toString() === 'true';

export class PubkySdk {
  private constructor() {}

  private static instance: Pubky | undefined;

  static get(): Pubky {
    if (!this.instance) {
      this.instance = TESTNET ? Pubky.testnet() : new Pubky();
    }
    return this.instance;
  }
}
