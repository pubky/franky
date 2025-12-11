export interface UseAuthUrlOptions {
  /**
   * Whether to automatically fetch the auth URL on mount.
   * @default true
   */
  autoFetch?: boolean;
}

export interface UseAuthUrlReturn {
  /** The authorization URL for QR code or deeplink */
  url: string;
  /** Whether the auth URL is currently being generated */
  isLoading: boolean;
  /** Whether a generation request is in progress (including retries) */
  isGenerating: boolean;
  /** Manually trigger auth URL generation */
  fetchUrl: () => Promise<void>;
  /** Current retry attempt count */
  retryCount: number;
}
