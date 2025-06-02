import { type NexusBootstrapResponse } from './types';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

export class NexusService {
  private static baseUrl = env.NEXT_PUBLIC_NEXUS_URL;

  static async bootstrap(userPK: string): Promise<NexusBootstrapResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bootstrap/${userPK}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch bootstrap data: ${response.statusText}`);
      }

      const data = await response.json();
      return data as NexusBootstrapResponse;
    } catch (error) {
      logger.error('Failed to fetch bootstrap data:', error);
      throw error;
    }
  }
}
