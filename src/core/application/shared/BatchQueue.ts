import * as Libs from '@/libs';

/**
 * Configuration for BatchQueue
 */
export interface BatchQueueConfig<TKey, TResult> {
  /** Name for logging purposes */
  name: string;
  /** Delay in ms before executing the batch (default: 50ms) */
  delayMs?: number;
  /** Function to execute the batch fetch */
  executeBatch: (keys: TKey[]) => Promise<Map<TKey, TResult> | void>;
  /** Optional: Get result for a key after batch completes (e.g., from local DB) */
  getResult?: (key: TKey) => Promise<TResult | null | undefined>;
}

/**
 * Pending batch state
 */
type BatchState<TKey, TResult> = {
  keys: Set<TKey>;
  resolvers: Map<TKey, Array<(result: TResult | null | undefined) => void>>;
  timeoutId: ReturnType<typeof setTimeout> | null;
};

/**
 * Generic batch queue for combining multiple rapid requests into fewer API calls.
 *
 * Features:
 * - Debouncing: Waits for a configurable delay to accumulate more keys
 * - Deduplication: Same key requested multiple times only fetches once
 * - In-flight tracking: Keys being fetched won't be re-fetched
 *
 * @example
 * ```ts
 * const userBatchQueue = new BatchQueue<string, UserDetails>({
 *   name: 'UserBatch',
 *   delayMs: 150,
 *   executeBatch: async (userIds) => {
 *     const users = await fetchUsersFromApi(userIds);
 *     await saveToLocalDb(users);
 *   },
 *   getResult: async (userId) => await db.users.get(userId),
 * });
 *
 * // These will be batched into a single API call
 * const [user1, user2] = await Promise.all([
 *   userBatchQueue.enqueue('user1'),
 *   userBatchQueue.enqueue('user2'),
 * ]);
 * ```
 */
export class BatchQueue<TKey, TResult> {
  private config: Required<BatchQueueConfig<TKey, TResult>>;
  private pendingBatch: BatchState<TKey, TResult> | null = null;
  private inFlight: Map<TKey, Promise<TResult | null | undefined>> = new Map();

  constructor(config: BatchQueueConfig<TKey, TResult>) {
    this.config = {
      delayMs: 50,
      getResult: async () => null,
      ...config,
    };
  }

  /**
   * Enqueue a key to be fetched in the next batch.
   * Returns a promise that resolves when the batch completes.
   */
  async enqueue(key: TKey): Promise<TResult | null | undefined> {
    // Check if already in-flight
    const existingRequest = this.inFlight.get(key);
    if (existingRequest) {
      Libs.Logger.debug(`[${this.config.name}] Reusing in-flight request for ${key}`);
      return existingRequest;
    }

    // Queue for batch
    return this.queueForBatch(key);
  }

  /**
   * Enqueue multiple keys to be fetched in the next batch.
   * More efficient than calling enqueue() multiple times.
   */
  async enqueueMany(keys: TKey[]): Promise<void> {
    if (keys.length === 0) return;

    const promises: Promise<unknown>[] = [];
    const keysToQueue: TKey[] = [];

    for (const key of keys) {
      const existingRequest = this.inFlight.get(key);
      if (existingRequest) {
        Libs.Logger.debug(`[${this.config.name}] Reusing in-flight request for ${key}`);
        promises.push(existingRequest);
      } else {
        keysToQueue.push(key);
      }
    }

    if (keysToQueue.length > 0) {
      promises.push(this.queueManyForBatch(keysToQueue));
    }

    await Promise.all(promises);
  }

  /**
   * Clear all pending and in-flight state.
   * Useful for testing.
   */
  clear(): void {
    if (this.pendingBatch?.timeoutId) {
      clearTimeout(this.pendingBatch.timeoutId);
    }
    this.pendingBatch = null;
    this.inFlight.clear();
  }

  private queueForBatch(key: TKey): Promise<TResult | null | undefined> {
    return new Promise((resolve) => {
      this.initBatchIfNeeded();

      this.pendingBatch!.keys.add(key);

      if (!this.pendingBatch!.resolvers.has(key)) {
        this.pendingBatch!.resolvers.set(key, []);
      }
      this.pendingBatch!.resolvers.get(key)!.push(resolve);

      this.resetDebounceTimer();
    });
  }

  private queueManyForBatch(keys: TKey[]): Promise<void> {
    return new Promise((resolve) => {
      this.initBatchIfNeeded();

      for (const key of keys) {
        this.pendingBatch!.keys.add(key);
      }

      // Store a single resolver for when any of these keys complete
      // We'll resolve when the batch completes
      const batchResolvers = this.pendingBatch!.resolvers;
      const firstKey = keys[0];
      if (!batchResolvers.has(firstKey)) {
        batchResolvers.set(firstKey, []);
      }
      batchResolvers.get(firstKey)!.push(() => resolve(undefined));

      this.resetDebounceTimer();
    });
  }

  private initBatchIfNeeded(): void {
    if (!this.pendingBatch) {
      this.pendingBatch = {
        keys: new Set(),
        resolvers: new Map(),
        timeoutId: null,
      };
    }
  }

  private resetDebounceTimer(): void {
    if (this.pendingBatch!.timeoutId) {
      clearTimeout(this.pendingBatch!.timeoutId);
    }

    this.pendingBatch!.timeoutId = setTimeout(() => {
      this.executeBatch();
    }, this.config.delayMs);
  }

  private async executeBatch(): Promise<void> {
    if (!this.pendingBatch) return;

    const batch = this.pendingBatch;
    this.pendingBatch = null;

    const keys = Array.from(batch.keys);

    if (keys.length === 0) {
      return;
    }

    Libs.Logger.debug(`[${this.config.name}] Executing batch for ${keys.length} items`);

    // Create promise for this batch execution
    const batchPromise = this.config.executeBatch(keys);

    // Register all keys as in-flight with individual promises
    for (const key of keys) {
      const keyPromise = batchPromise.then(async () => {
        return await this.config.getResult(key);
      });
      this.inFlight.set(key, keyPromise);
    }

    try {
      await batchPromise;
    } finally {
      // Clean up in-flight status and resolve all waiting callers
      for (const key of keys) {
        this.inFlight.delete(key);
        const result = await this.config.getResult(key);
        const resolvers = batch.resolvers.get(key) || [];
        resolvers.forEach((resolve) => resolve(result));
      }
    }
  }
}
