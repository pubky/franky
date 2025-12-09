import { createNexusError, Env, isAppError, NexusErrorType } from '@/libs';

/**
 * BlockTank API response types
 */
interface BlockTankTicker {
  symbol: string;
  lastPrice: string;
  base: string;
  baseName: string;
  quote: string;
  quoteName: string;
  currencySymbol: string;
  currencyFlag: string;
  lastUpdatedAt: number;
}

interface BlockTankResponse {
  tickers: BlockTankTicker[];
}

/**
 * Fetches the BTC/USD exchange rate from BlockTank API
 *
 * @returns Promise resolving to the BTC/USD exchange rate as a number
 * @throws {AppError} If the API request fails, response is invalid, or BTCUSD ticker is not found
 *
 * @example
 * const rate = await getBtcUsdRate();
 * console.log(`1 BTC = $${rate}`);
 */
export async function getBtcUsdRate(): Promise<number> {
  const apiUrl = Env.NEXT_PUBLIC_EXCHANGE_RATE_API;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw createNexusError(
        NexusErrorType.NETWORK_ERROR,
        `Failed to fetch exchange rate: ${response.statusText}`,
        response.status,
        { url: apiUrl, statusCode: response.status },
      );
    }

    const data: BlockTankResponse = await response.json();

    if (!data.tickers || !Array.isArray(data.tickers)) {
      throw createNexusError(NexusErrorType.INVALID_RESPONSE, 'Invalid response format from exchange rate API', 500, {
        url: apiUrl,
      });
    }

    const btcUsdTicker = data.tickers.find((ticker) => ticker.symbol === 'BTCUSD');

    if (!btcUsdTicker) {
      throw createNexusError(NexusErrorType.RESOURCE_NOT_FOUND, 'BTCUSD ticker not found in API response', 404, {
        url: apiUrl,
        availableSymbols: data.tickers.map((t) => t.symbol),
      });
    }

    const rate = parseFloat(btcUsdTicker.lastPrice);

    if (isNaN(rate) || rate <= 0) {
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

    // Wrap other errors (network failures, JSON parse errors, etc.)
    throw createNexusError(
      NexusErrorType.NETWORK_ERROR,
      `Failed to fetch BTC/USD exchange rate: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      { url: apiUrl, originalError: error },
    );
  }
}

export interface BtcRate {
  /**
   * The current SAT/USD rate
   */
  satUsd: number;
  /**
   * The current BTC/USD rate
   */
  btcUsd: number;
  /**
   * The timestamp of the last update
   */
  lastUpdatedAt: Date;
}

export async function getSatoshiUsdRate(): Promise<BtcRate> {
  const btcusd = await getBtcUsdRate();
  return {
    satUsd: btcusd / 100_000_000,
    btcUsd: btcusd,
    lastUpdatedAt: new Date(),
  };
}
