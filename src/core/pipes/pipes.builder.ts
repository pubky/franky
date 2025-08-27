import { PubkySpecsBuilder } from 'pubky-app-specs';

export class PubkySpecsSingleton {
  private static builder: PubkySpecsBuilder | null = null;

  private constructor() {}
  
  static get(pubky: string): PubkySpecsBuilder {
    if (!this.builder) {
      this.builder = new PubkySpecsBuilder(pubky);
    }
    return this.builder
  }
}