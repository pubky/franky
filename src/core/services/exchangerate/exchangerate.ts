import { createNexusError, Env, isAppError, NexusErrorType } from '@/libs';
import { exchangerateQueryClient } from './exchangerate.query-client';
import { BlockTankResponse, BtcRate } from './exchangerate.types';

/**
 * Exchange rate service class.
 * Handles fetching BTC/USD and SAT/USD exchange rates from external APIs.
 */
export class ExchangerateService {
  private constructor() {} // Prevent instantiation

  /**
   * Fetches the BTC/USD exchange rate from BlockTank API
   *
   * @returns Promise resolving to the BTC/USD exchange rate as a number
   * @throws {AppError} If the API request fails, response is invalid, or BTCUSD ticker is not found
   */
  private static async getBtcUsdRate(): Promise<number> {
    const apiUrl = Env.NEXT_PUBLIC_EXCHANGE_RATE_API;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        // TODO: Wrap in a generic error type
        throw createNexusError(
          NexusErrorType.SERVICE_UNAVAILABLE,
          `Failed to fetch exchange rate: ${response.statusText}`,
          response.status,
          { url: apiUrl, statusCode: response.status },
        );
      }

      const data: BlockTankResponse = await response.json();

      if (!data.tickers || !Array.isArray(data.tickers)) {
        // TODO: Wrap in a generic error type
        throw createNexusError(NexusErrorType.INVALID_RESPONSE, 'Invalid response format from exchange rate API', 500, {
          url: apiUrl,
        });
      }

      const btcUsdTicker = data.tickers.find((ticker) => ticker.symbol === 'BTCUSD');

      if (!btcUsdTicker) {
        // TODO: Wrap in a generic error type
        throw createNexusError(NexusErrorType.RESOURCE_NOT_FOUND, 'BTCUSD ticker not found in API response', 404, {
          url: apiUrl,
          availableSymbols: data.tickers.map((t) => t.symbol),
        });
      }

      const rate = parseFloat(btcUsdTicker.lastPrice);

      if (isNaN(rate) || rate <= 0) {
        // TODO: Wrap in a generic error type
        throw createNexusError(
          NexusErrorType.INVALID_RESPONSE,
          `Invalid exchange rate value: ${btcUsdTicker.lastPrice}`,
          500,
          { url: apiUrl, lastPrice: btcUsdTicker.lastPrice },
        );
      }

      return rate;
    } catch (error) {
      // Re-throw AppError instances as-is
      if (isAppError(error)) {
        throw error;
      }

      // TODO: Wrap other errors (network failures, JSON parse errors, etc.)
      throw createNexusError(
        NexusErrorType.SERVICE_UNAVAILABLE,
        `Failed to fetch BTC/USD exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        { url: apiUrl, originalError: error },
      );
    }
  }

  /**
   * Gets the current SAT/USD and BTC/USD exchange rate.
   *
   * @returns Promise resolving to the BTC rate with satUsd, btcUsd, and lastUpdatedAt
   * @throws {AppError} If the API request fails, response is invalid, or BTCUSD ticker is not found
   *
   * @example
   * const rate = await ExchangerateService.getSatoshiUsdRate();
   * console.log(`1 SAT = $${rate.satUsd}`);
   */
  static async getSatoshiUsdRate(): Promise<BtcRate> {
    return exchangerateQueryClient.fetchQuery({
      queryKey: ['exchangerate', 'btc-rate'],
      queryFn: async () => {
        const btcusd = await ExchangerateService.getBtcUsdRate();
        return {
          satUsd: btcusd / 100_000_000,
          btcUsd: btcusd,
          lastUpdatedAt: new Date(),
        };
      },
    });
  }
}
