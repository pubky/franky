import { type NexusBootstrapResponse } from './types';
import { env } from '@/lib/env';
import { createNexusError, NexusErrorType, mapHttpStatusToNexusErrorType } from '@/lib/error';

export class NexusService {
  private static baseUrl = env.NEXT_PUBLIC_NEXUS_URL;

  static async bootstrap(userPK: string): Promise<NexusBootstrapResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bootstrap/${userPK}`);

      if (!response.ok) {
        const errorType = mapHttpStatusToNexusErrorType(response.status);
        throw createNexusError(errorType, `Bootstrap request failed: ${response.statusText}`, response.status, {
          userPK,
          statusCode: response.status,
          statusText: response.statusText,
        });
      }

      let data: unknown;
      try {
        data = await response.json();
      } catch (error) {
        throw createNexusError(NexusErrorType.INVALID_RESPONSE, 'Failed to parse bootstrap response', 500, {
          error,
          userPK,
        });
      }

      return data as NexusBootstrapResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      // Handle network/fetch errors
      throw createNexusError(NexusErrorType.NETWORK_ERROR, 'Failed to fetch bootstrap data', 500, { error, userPK });
    }
  }
}
