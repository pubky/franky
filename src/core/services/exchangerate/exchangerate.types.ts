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

export interface BlockTankResponse {
  tickers: BlockTankTicker[];
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
