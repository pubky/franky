import { PubkySpecsBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PubkySpecsSingleton {
  private static builder: PubkySpecsBuilder | null = null;
  private static currentPubky: Core.Pubky | null = null;

  private constructor() {}

  static get(pubky: Core.Pubky): PubkySpecsBuilder {
    if (!this.builder) {
      this.builder = new PubkySpecsBuilder(pubky);
      this.currentPubky = pubky;
    }
    // If pubky has changed, recreate the builder only if the new pubky is valid
    else if (this.currentPubky !== pubky) {
      try {
        this.builder = new PubkySpecsBuilder(pubky);
        this.currentPubky = pubky;
      } catch {
        Libs.Logger.error('Invalid pubky. Using existing builder.', { pubky });
        return this.builder;
      }
    }
    return this.builder;
  }
}
