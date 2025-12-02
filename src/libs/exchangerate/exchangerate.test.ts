import { describe, it, expect, vi, afterEach } from 'vitest';
import { getBtcUsdRate, getSatoshiUsdRate } from './exchangerate';
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

afterEach(() => {
  vi.resetAllMocks();
});

describe('getBtcUsdRate', () => {
  it('returns the BTC/USD rate when ticker is present', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        tickers: [createTicker({ lastPrice: '87076.00' })],
      }),
    } as Response);

    const rate = await getBtcUsdRate();

    expect(rate).toEqual(87076.0);
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

    await expect(getBtcUsdRate()).rejects.toMatchObject({
      type: NexusErrorType.RESOURCE_NOT_FOUND,
    });
  });

  it('wraps network errors in a NETWORK_ERROR AppError', async () => {
    mockFetch.mockRejectedValue(new Error('Network down'));

    await expect(getBtcUsdRate()).rejects.toMatchObject({
      type: NexusErrorType.NETWORK_ERROR,
    });
  });

  it('returns the SAT/USD rate when ticker is present', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        tickers: [createTicker({ lastPrice: '87076.00' })],
      }),
    } as Response);

    const rate = await getSatoshiUsdRate();

    expect(rate).toEqual(0.00087076);
    expect(mockFetch).toHaveBeenCalledWith(Env.NEXT_PUBLIC_EXCHANGE_RATE_API);
  });
});
