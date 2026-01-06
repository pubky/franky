import * as Core from '@/core';
import { Env, Logger } from '@/libs';
import type {
  TtlCoordinatorConfig,
  TtlCoordinatorState,
  TtlSubscribePostParams,
  TtlUnsubscribePostParams,
  TtlSubscribeUserParams,
  TtlUnsubscribeUserParams,
} from './ttl.types';

/**
 * TtlCoordinator
 *
 * Viewport-aware coordinator that manages data freshness for posts and users.
 * Unlike polling coordinators, this is subscription-based:
 *
 * - UI components call subscribePost/unsubscribePost based on viewport visibility
 * - Coordinator tracks subscriptions and batches refresh requests
 * - On each tick, checks TTL tables and refreshes stale entities
 *
 * Staleness formula: now - lastUpdatedAt > TTL_MS
 *
 * Architecture:
 * - Posts: subscribedPosts Set + postBatchQueue Set
 * - Users: subscribedUsers Set + userBatchQueue Set (ref-counted for multiple subscribers)
 *
 * Note: Post and user subscriptions are independent.
 * User subscriptions are managed explicitly via subscribeUser/unsubscribeUser,
 * with reference counting to handle multiple subscribers to the same user.
 */
export class TtlCoordinator {
  private static instance: TtlCoordinator | null = null;

  // Configuration
  private config: TtlCoordinatorConfig = {
    postTtlMs: Env.NEXT_PUBLIC_TTL_POST_MS,
    userTtlMs: Env.NEXT_PUBLIC_TTL_USER_MS,
    batchIntervalMs: Env.NEXT_PUBLIC_TTL_BATCH_INTERVAL_MS,
    postMaxBatchSize: Env.NEXT_PUBLIC_TTL_POST_MAX_BATCH_SIZE,
    userMaxBatchSize: Env.NEXT_PUBLIC_TTL_USER_MAX_BATCH_SIZE,
  };

  // Internal state
  private state: TtlCoordinatorState = {
    intervalId: null,
    isStarted: false,
    currentRoute: '',
    isPageVisible: true,
    subscribedPosts: new Set(),
    subscribedUsers: new Set(),
    userRefCount: new Map(),
    postBatchQueue: new Set(),
    userBatchQueue: new Set(),
  };

  // Store unsubscribers
  private authStoreUnsubscribe: (() => void) | null = null;
  private visibilityChangeHandler: (() => void) | null = null;
  private isTickLoopActive = false;

  private constructor() {
    this.setupListeners();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the singleton instance of TtlCoordinator
   */
  public static getInstance(): TtlCoordinator {
    if (!TtlCoordinator.instance) {
      TtlCoordinator.instance = new TtlCoordinator();
    }
    return TtlCoordinator.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (TtlCoordinator.instance) {
      TtlCoordinator.instance.destroy();
      TtlCoordinator.instance = null;
    }
  }

  /**
   * Start the TTL coordinator
   * Begins the batch tick interval
   */
  public start(): void {
    if (this.state.isStarted) {
      return;
    }

    this.state.isStarted = true;
    this.evaluateAndStartTicking();
    Logger.debug('TtlCoordinator started');
  }

  /**
   * Stop the TTL coordinator
   * Stops the batch tick interval and clears state
   */
  public stop(): void {
    this.state.isStarted = false;
    this.stopTicking();
    this.reset();
    Logger.debug('TtlCoordinator stopped');
  }

  /**
   * Set the current route
   * Triggers reset when route changes to clear stale subscriptions
   */
  public setRoute(route: string): void {
    if (this.state.currentRoute !== route) {
      const previousRoute = this.state.currentRoute;
      this.state.currentRoute = route;

      // Reset subscriptions on route change
      if (previousRoute !== '') {
        this.reset();
        Logger.debug('TtlCoordinator reset on route change', { from: previousRoute, to: route });
      }
    }
  }

  /**
   * Subscribe to a post's TTL tracking
   */
  public subscribePost({ compositePostId }: TtlSubscribePostParams): void {
    // Idempotent: don't double-subscribe
    if (this.state.subscribedPosts.has(compositePostId)) {
      return;
    }

    // Add to subscribed posts
    this.state.subscribedPosts.add(compositePostId);

    // Check if post is stale and queue for refresh
    void this.checkAndQueuePost(compositePostId);
  }

  /**
   * Unsubscribe from a post's TTL tracking
   */
  public unsubscribePost({ compositePostId }: TtlUnsubscribePostParams): void {
    // Safe if called multiple times or for unknown IDs
    if (!this.state.subscribedPosts.has(compositePostId)) {
      return;
    }

    // Remove from subscribed posts
    this.state.subscribedPosts.delete(compositePostId);
    this.state.postBatchQueue.delete(compositePostId);
  }

  /**
   * Subscribe to a user's TTL tracking directly
   * Use this for user profiles not associated with posts
   */
  public subscribeUser({ pubky }: TtlSubscribeUserParams): void {
    this.incrementUserRefCount(pubky);
    void this.checkAndQueueUser(pubky);
  }

  /**
   * Unsubscribe from a user's TTL tracking directly
   */
  public unsubscribeUser({ pubky }: TtlUnsubscribeUserParams): void {
    this.decrementUserRefCount(pubky);
  }

  /**
   * Configure the coordinator at runtime
   */
  public configure(config: Partial<TtlCoordinatorConfig>): void {
    const oldInterval = this.config.batchIntervalMs;
    this.config = { ...this.config, ...config };

    // Restart ticking if interval changed
    if (oldInterval !== this.config.batchIntervalMs && this.state.intervalId) {
      this.stopTicking();
      this.evaluateAndStartTicking();
    }

    Logger.debug('TtlCoordinator configured', { config: this.config });
  }

  /**
   * Cleanup and destroy the coordinator instance
   */
  public destroy(): void {
    this.stop();
    this.removeListeners();
  }

  // ============================================================================
  // Private: Lifecycle
  // ============================================================================

  /**
   * Setup event listeners for auth state and page visibility
   */
  private setupListeners(): void {
    // Listen to auth store changes
    this.authStoreUnsubscribe = Core.useAuthStore.subscribe((state, prevState) => {
      const isAuthenticated = state.selectIsAuthenticated();
      const wasAuthenticated = prevState.selectIsAuthenticated();

      if (isAuthenticated !== wasAuthenticated) {
        Logger.debug('TtlCoordinator: Auth state changed', { isAuthenticated });

        if (!isAuthenticated) {
          // User logged out - stop and reset
          this.stopTicking();
          this.reset();
        } else {
          // User logged in - start if coordinator is started
          this.evaluateAndStartTicking();
        }
      }
    });

    // Listen to page visibility changes
    if (typeof document !== 'undefined') {
      this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
      document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    }
  }

  /**
   * Remove all event listeners
   */
  private removeListeners(): void {
    if (this.authStoreUnsubscribe) {
      this.authStoreUnsubscribe();
      this.authStoreUnsubscribe = null;
    }

    if (typeof document !== 'undefined' && this.visibilityChangeHandler) {
      document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      this.visibilityChangeHandler = null;
    }
  }

  /**
   * Handle page visibility change
   */
  private handleVisibilityChange(): void {
    const isVisible = document.visibilityState === 'visible';
    if (this.state.isPageVisible !== isVisible) {
      this.state.isPageVisible = isVisible;
      Logger.debug('TtlCoordinator: Page visibility changed', { isVisible });
      this.evaluateAndStartTicking();
    }
  }

  /**
   * Evaluate conditions and start/stop ticking accordingly
   */
  private evaluateAndStartTicking(): void {
    if (this.shouldTick()) {
      this.startTicking();
    } else {
      this.stopTicking();
    }
  }

  /**
   * Determine if ticking should be active
   */
  private shouldTick(): boolean {
    // Must be manually started
    if (!this.state.isStarted) {
      return false;
    }

    // Must be authenticated
    const authState = Core.useAuthStore.getState();
    if (!authState.selectIsAuthenticated() || !authState.hasProfile) {
      return false;
    }

    // Must have visible page
    if (!this.state.isPageVisible) {
      return false;
    }

    return true;
  }

  /**
   * Start the batch tick interval
   */
  private startTicking(): void {
    if (this.isTickLoopActive) {
      return;
    }

    this.isTickLoopActive = true;
    Logger.debug('TtlCoordinator: Starting batch tick loop', { intervalMs: this.config.batchIntervalMs });
    this.scheduleNextTick(0);
  }

  /**
   * Stop the batch tick interval
   */
  private stopTicking(): void {
    this.isTickLoopActive = false;
    if (this.state.intervalId) {
      clearTimeout(this.state.intervalId);
      this.state.intervalId = null;
    }
    Logger.debug('TtlCoordinator: Stopped batch tick loop');
  }

  private scheduleNextTick(delayMs: number): void {
    if (!this.isTickLoopActive) return;

    // Ensure we only ever have one scheduled callback at a time
    if (this.state.intervalId) {
      clearTimeout(this.state.intervalId);
      this.state.intervalId = null;
    }

    this.state.intervalId = setTimeout(() => {
      void this.tickOnceAndReschedule();
    }, delayMs);
  }

  private async tickOnceAndReschedule(): Promise<void> {
    if (!this.isTickLoopActive) return;

    // If lifecycle conditions changed, stop the loop and exit.
    if (!this.shouldTick()) {
      this.stopTicking();
      return;
    }

    try {
      await this.onBatchTick();
    } finally {
      // Schedule next tick only after the current one completes.
      if (this.isTickLoopActive && this.shouldTick()) {
        this.scheduleNextTick(this.config.batchIntervalMs);
      } else {
        this.stopTicking();
      }
    }
  }

  /**
   * Reset all subscription state
   * Called on route change and logout
   */
  private reset(): void {
    this.state.subscribedPosts.clear();
    this.state.subscribedUsers.clear();
    this.state.userRefCount.clear();
    this.state.postBatchQueue.clear();
    this.state.userBatchQueue.clear();
  }

  // ============================================================================
  // Private: Reference Counting
  // ============================================================================

  /**
   * Increment user reference count
   */
  private incrementUserRefCount(userId: Core.Pubky): void {
    const currentCount = this.state.userRefCount.get(userId) ?? 0;
    this.state.userRefCount.set(userId, currentCount + 1);

    // Add to subscribed users if first reference
    if (currentCount === 0) {
      this.state.subscribedUsers.add(userId);
    }
  }

  /**
   * Decrement user reference count
   * Removes from subscription when count reaches 0
   */
  private decrementUserRefCount(userId: Core.Pubky): void {
    const currentCount = this.state.userRefCount.get(userId) ?? 0;

    if (currentCount <= 1) {
      // Last reference - unsubscribe
      this.state.userRefCount.delete(userId);
      this.state.subscribedUsers.delete(userId);
      this.state.userBatchQueue.delete(userId);
    } else {
      // Decrement
      this.state.userRefCount.set(userId, currentCount - 1);
    }
  }

  // ============================================================================
  // Private: Staleness Checks
  // ============================================================================

  /**
   * Check if a post is stale and add to batch queue
   */
  private async checkAndQueuePost(compositePostId: string): Promise<void> {
    try {
      const staleIds = await Core.TtlController.findStalePostsByIds({
        postIds: [compositePostId],
        ttlMs: this.config.postTtlMs,
      });

      // Guard against async race: only enqueue if still subscribed
      if (staleIds.includes(compositePostId) && this.state.subscribedPosts.has(compositePostId)) {
        this.state.postBatchQueue.add(compositePostId);
      }
    } catch (error) {
      // On error, assume stale and queue for refresh
      if (this.state.subscribedPosts.has(compositePostId)) {
        this.state.postBatchQueue.add(compositePostId);
      }
      Logger.warn('TtlCoordinator: Error checking post TTL', { compositePostId, error });
    }
  }

  /**
   * Check if a user is stale and add to batch queue
   */
  private async checkAndQueueUser(userId: Core.Pubky): Promise<void> {
    try {
      const staleIds = await Core.TtlController.findStaleUsersByIds({
        userIds: [userId],
        ttlMs: this.config.userTtlMs,
      });

      // Guard against async race: only enqueue if still subscribed
      if (staleIds.includes(userId) && this.state.subscribedUsers.has(userId)) {
        this.state.userBatchQueue.add(userId);
      }
    } catch (error) {
      // On error, assume stale and queue for refresh
      if (this.state.subscribedUsers.has(userId)) {
        this.state.userBatchQueue.add(userId);
      }
      Logger.warn('TtlCoordinator: Error checking user TTL', { userId, error });
    }
  }

  // ============================================================================
  // Private: Batch Tick
  // ============================================================================

  /**
   * Main batch tick handler
   * Checks all subscriptions for staleness and fires batch refreshes
   */
  private async onBatchTick(): Promise<void> {
    // Skip if not authenticated
    const authState = Core.useAuthStore.getState();
    if (!authState.selectIsAuthenticated()) {
      return;
    }

    const viewerId = authState.currentUserPubky;

    // Check all subscribed posts for staleness
    await this.checkAllPostsForStaleness();

    // Check all subscribed users for staleness
    await this.checkAllUsersForStaleness();

    // Fire batch refresh for posts
    await this.refreshStalePosts(viewerId);

    // Fire batch refresh for users
    await this.refreshStaleUsers(viewerId);
  }

  /**
   * Check all subscribed posts and queue stale ones
   */
  private async checkAllPostsForStaleness(): Promise<void> {
    const postIds = Array.from(this.state.subscribedPosts);
    if (postIds.length === 0) return;

    try {
      const staleIds = await Core.TtlController.findStalePostsByIds({
        postIds,
        ttlMs: this.config.postTtlMs,
      });

      for (const id of staleIds) {
        // Guard: don't enqueue if unsubscribed mid-flight
        if (this.state.subscribedPosts.has(id)) {
          this.state.postBatchQueue.add(id);
        }
      }
    } catch (error) {
      Logger.warn('TtlCoordinator: Error checking posts for staleness', { error });
    }
  }

  /**
   * Check all subscribed users and queue stale ones
   */
  private async checkAllUsersForStaleness(): Promise<void> {
    const userIds = Array.from(this.state.subscribedUsers);
    if (userIds.length === 0) return;

    try {
      const staleIds = await Core.TtlController.findStaleUsersByIds({
        userIds,
        ttlMs: this.config.userTtlMs,
      });

      for (const id of staleIds) {
        // Guard: don't enqueue if unsubscribed mid-flight
        if (this.state.subscribedUsers.has(id)) {
          this.state.userBatchQueue.add(id);
        }
      }
    } catch (error) {
      Logger.warn('TtlCoordinator: Error checking users for staleness', { error });
    }
  }

  /**
   * Refresh stale posts in batches
   */
  private async refreshStalePosts(viewerId: Core.Pubky | null): Promise<void> {
    if (this.state.postBatchQueue.size === 0) return;

    // viewerId is required for fetching posts - skip if not authenticated
    if (!viewerId) {
      Logger.warn('TtlCoordinator: Cannot refresh posts without viewerId');
      return;
    }

    // Take up to maxBatchSize posts
    const postIds = Array.from(this.state.postBatchQueue).slice(0, this.config.postMaxBatchSize);

    try {
      Logger.debug('TtlCoordinator: Refreshing stale posts', { count: postIds.length });

      // Fetch and persist posts
      await Core.TtlController.forceRefreshPostsByIds({ postIds, viewerId });

      // SUCCESS: Remove from queue and update TTL
      for (const id of postIds) {
        this.state.postBatchQueue.delete(id);
      }
    } catch (error) {
      // FAILURE: Leave in queue for retry on next tick
      Logger.warn('TtlCoordinator: Error refreshing stale posts', { postIds, error });
    }
  }

  /**
   * Refresh stale users in batches
   */
  private async refreshStaleUsers(viewerId: Core.Pubky | null): Promise<void> {
    if (this.state.userBatchQueue.size === 0) return;

    // Take up to maxBatchSize users
    const userIds = Array.from(this.state.userBatchQueue).slice(0, this.config.userMaxBatchSize);

    try {
      Logger.debug('TtlCoordinator: Refreshing stale users', { count: userIds.length });

      // Fetch and persist users
      await Core.TtlController.forceRefreshUsersByIds({ userIds, viewerId: viewerId ?? undefined });

      // SUCCESS: Remove from queue and update TTL
      for (const id of userIds) {
        this.state.userBatchQueue.delete(id);
      }
    } catch (error) {
      // FAILURE: Leave in queue for retry on next tick
      Logger.warn('TtlCoordinator: Error refreshing stale users', { userIds, error });
    }
  }
}
