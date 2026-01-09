import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { ExchangerateService } from './exchangerate';
import { exchangerateQueryClient } from './exchangerate.query-client';
import { Env, NexusErrorType } from '@/libs';

// Helper to build a minimal BlockTank ticker
function createTicker(overrides: Partial<{ symbol: string; lastPrice: string }> = {}) {
  return {
    symbol: 'BTCUSD',
    lastPrice: '87076.00',
    base: 'BTC',
    baseName: 'Bitcoin',
    quote: 'USD',
    quoteName: 'US Dollar',
    currencySymbol: '$',
    currencyFlag: '🇺🇸',
    lastUpdatedAt: Date.now(),
    ...overrides,
  };
}

const mockFetch = vi.fn();

global.fetch = mockFetch as unknown as typeof global.fetch;

beforeEach(() => {
  // Clear the query client cache before each test to avoid stale data
  exchangerateQueryClient.clear();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('ExchangerateService', () => {
  describe('getSatoshiUsdRate', () => {
    it('returns the SAT/USD rate when ticker is present', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tickers: [createTicker({ lastPrice: '87076.00' })],
        }),
      } as Response);

      const rate = await ExchangerateService.getSatoshiUsdRate();

      expect(rate.satUsd).toEqual(0.00087076);
      expect(rate.btcUsd).toEqual(87076.0);
      expect(rate.lastUpdatedAt).toBeInstanceOf(Date);
      expect(mockFetch).toHaveBeenCalledWith(Env.NEXT_PUBLIC_EXCHANGE_RATE_API);
    });

    it('throws RESOURCE_NOT_FOUND when BTCUSD ticker is missing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          tickers: [createTicker({ symbol: 'BTCEUR' })],
        }),
      } as Response);

      await expect(ExchangerateService.getSatoshiUsdRate()).rejects.toMatchObject({
        type: NexusErrorType.RESOURCE_NOT_FOUND,
      });
    });

    it('wraps network errors in a SERVICE_UNAVAILABLE AppError', async () => {
      // Mock must reject consistently for all retry attempts
      mockFetch.mockRejectedValue(new Error('Network down'));

      await expect(ExchangerateService.getSatoshiUsdRate()).rejects.toMatchObject({
        type: NexusErrorType.SERVICE_UNAVAILABLE,
      });
    }, 15000); // Extended timeout to allow for retry attempts
  });
});
