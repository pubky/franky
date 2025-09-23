import { PubkySpecsBuilder } from 'pubky-app-specs';
import * as Core from '@/core';

export class PubkySpecsSingleton {
  private static builder: PubkySpecsBuilder | null = null;

  private constructor() {}

  static get(pubky: Core.Pubky): PubkySpecsBuilder {
    if (!this.builder) {
      this.builder = new PubkySpecsBuilder(pubky);
    }
    return this.builder;
  }
}
