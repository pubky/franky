import * as Core from '@/core';
import { Env, Logger } from '@/libs';
import { APP_ROUTES, POST_ROUTES } from '@/app/routes';
import type { PostStreamId } from '@/core/models';
import {
  Coordinator,
  routeToRegex,
  PollingInactiveReason,
  type StreamCoordinatorConfig,
  type StreamCoordinatorState,
} from '@/core/coordinators';

/**
 * Map home content filter values to stream kind values
 * Note: Home uses plural forms, streams use singular
 */
const CONTENT_TO_KIND_MAP: Record<string, string> = {
  all: 'all',
  short: 'short',
  long: 'long',
  images: 'image',
  videos: 'video',
  links: 'link',
  files: 'file',
};

/**
 * StreamCoordinator
 *
 * Centralized coordinator for managing stream polling lifecycle.
 * Polls for new posts on /home and /post routes, updating the post_streams cache.
 *
 * This is a singleton coordinator that should be accessed via getInstance().
 * Typically managed by CoordinatorsManager component in the app layout.
 *
 * The coordinator's responsibility is to poll Nexus for new posts and update
 * the post_streams cache. UI components will reactively update from the cache.
 */
export class StreamCoordinator extends Coordinator<StreamCoordinatorConfig, StreamCoordinatorState> {
  private static instance: StreamCoordinator | null = null;

  // Extended configuration
  private streamConfig: Required<Pick<StreamCoordinatorConfig, 'enabledRoutes' | 'fetchLimit'>> = {
    enabledRoutes: [routeToRegex(APP_ROUTES.HOME), routeToRegex(POST_ROUTES.POST)],
    fetchLimit: Env.NEXT_PUBLIC_STREAM_FETCH_LIMIT,
  };

  // Extended state
  private streamState: Required<Pick<StreamCoordinatorState, 'currentStreamId' | 'streamHead'>> = {
    currentStreamId: null,
    streamHead: 0,
  };

  // Store unsubscribers
  private homeStoreUnsubscribe: (() => void) | null = null;

  private constructor() {
    super({
      initialConfig: {
        intervalMs: 5000, //Env.NEXT_PUBLIC_STREAM_POLL_INTERVAL_MS,
        pollOnStart: Env.NEXT_PUBLIC_STREAM_POLL_ON_START,
        respectPageVisibility: Env.NEXT_PUBLIC_STREAM_RESPECT_PAGE_VISIBILITY,
      },
    });
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the singleton instance of StreamCoordinator
   */
  public static getInstance(): StreamCoordinator {
    if (!StreamCoordinator.instance) {
      StreamCoordinator.instance = new StreamCoordinator();
    }
    return StreamCoordinator.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (StreamCoordinator.instance) {
      StreamCoordinator.instance.destroy();
      StreamCoordinator.instance = null;
    }
  }

  /**
   * Configure the polling coordinator at runtime.
   *
   * Updates polling settings (interval, enabled routes, etc.) without recreating the instance.
   * If the polling interval changes while polling is active, it will restart with the new interval.
   *
   * @param config - Partial configuration to merge with existing settings
   *
   * @example
   * ```typescript
   * coordinator.configure({ intervalMs: 15000 }); // Change to 15 second polling
   * coordinator.configure({ fetchLimit: 20 }); // Fetch 20 posts per poll
   * ```
   */
  public configure(config: Partial<StreamCoordinatorConfig>): void {
    // Update base config
    super.configure(config);

    // Update stream-specific config
    if (config.enabledRoutes) {
      this.streamConfig.enabledRoutes = config.enabledRoutes;
    }
    if (config.fetchLimit !== undefined) {
      this.streamConfig.fetchLimit = config.fetchLimit;
    }
  }

  // ============================================================================
  // Protected API (override base class methods)
  // ============================================================================

  /**
   * Setup event listeners for auth state, page visibility, home store changes
   */
  protected setupListeners(): void {
    // Call parent to setup base listeners (auth, visibility)
    super.setupListeners();
    // Listen to home store changes (sort, reach, content affect streamId)
    this.homeStoreUnsubscribe = Core.useHomeStore.subscribe((state, prevState) => {
      // Only re-evaluate if we're on /home and relevant fields changed
      const currentState = this.getState();
      if (currentState.currentRoute === APP_ROUTES.HOME) {
        const stateChanged =
          state.sort !== prevState.sort || state.reach !== prevState.reach || state.content !== prevState.content;

        if (stateChanged) {
          Logger.debug('Home store changed, re-evaluating stream', {
            sort: state.sort,
            reach: state.reach,
            content: state.content,
          });

          this.evaluateAndStartPolling();
        }
      }
    });
  }

  /**
   * Remove all event listeners
   */
  protected removeListeners(): void {
    // Call parent to remove base listeners
    super.removeListeners();

    // Remove stream-specific listeners
    if (this.homeStoreUnsubscribe) {
      this.homeStoreUnsubscribe();
      this.homeStoreUnsubscribe = null;
    }
  }

  /**
   * Start the polling interval
   */
  protected startPolling(): void {
    // Resolve and cache current stream ID before starting
    this.resolveStreamId();

    Logger.debug('Starting stream polling', {
      intervalMs: this.getConfig().intervalMs,
      streamId: this.streamState.currentStreamId,
    });

    // Call parent to start polling
    super.startPolling();
  }

  /**
   * Stop the polling interval
   */
  protected stopPolling(reason: PollingInactiveReason): void {
    // Call parent to stop polling
    super.stopPolling(reason);

    // Clear stream-specific state
    this.streamState.currentStreamId = null;
  }

  // ============================================================================
  // Protected API (abstract method implementations)
  // ============================================================================

  /**
   * Additional checks specific to stream coordinator
   * Must be able to determine stream ID
   */
  protected shouldPollAdditionalChecks(): boolean {
    // Ensure we try to resolve the stream ID before deciding
    this.resolveStreamId();

    // Must be able to determine stream ID
    if (!this.streamState.currentStreamId) {
      return false;
    }
    return true;
  }

  /**
   * Execute a single poll operation
   */
  protected async poll(): Promise<void> {
    try {
      // Re-resolve stream ID in case route/state changed
      this.resolveStreamId();
      if (!this.streamState.currentStreamId) {
        Logger.warn('Cannot poll: invalid stream ID');
        return;
      }

      Logger.debug('Polling stream for new posts', { streamId: this.streamState.currentStreamId });

      // Fetch latest posts from Nexus (streamTail: 0 means fetch from the top/latest)
      const { nextPageIds } = await Core.StreamPostsController.getOrFetchStreamSlice({
        streamId: this.streamState.currentStreamId,
        streamTail: 0,
        limit: this.streamConfig.fetchLimit,
      });
      // TODO: Get the 0 index from the stream and update the streamHead

      // Get cached stream from IndexedDB
      const cachedStream = await Core.PostStreamModel.table.get(this.streamState.currentStreamId);
      Logger.debug('Cached stream', { cachedStream });

      // Determine new posts (posts not in cache)
      let newPosts: string[] = [];
      if (!cachedStream) {
        // No cache yet, all posts are "new"
        newPosts = nextPageIds;
        Logger.debug('First time polling this stream, all posts are new', {
          streamId: this.streamState.currentStreamId,
          newPostsCount: newPosts.length,
        });
      } else {
        // Filter out posts that already exist in cache
        newPosts = nextPageIds.filter((postId) => !cachedStream.stream.includes(postId));
        Logger.debug('Found new posts in stream', {
          streamId: this.streamState.currentStreamId,
          totalFetched: nextPageIds.length,
          newPostsCount: newPosts.length,
        });
      }

      // Update cache with new posts if any
      if (newPosts.length > 0) {
        if (cachedStream) {
          // Prepend new posts to existing stream (chronological order - newest first)
          const updatedStream = [...newPosts, ...cachedStream.stream];
          //await Core.PostStreamModel.upsert(streamId, updatedStream);
        } else {
          // Create new cache entry
          //await Core.PostStreamModel.create(streamId, newPosts);
        }

        Logger.info('Stream cache updated with new posts', {
          streamId: this.streamState.currentStreamId,
          newPostsCount: newPosts.length,
        });
      }
    } catch (error) {
      Logger.error('Error polling stream', { error });
      // Don't stop polling on error - just log and continue
    }
  }

  /**
   * Check if current route is in the enabled routes list
   */
  protected isRouteAllowed(): boolean {
    const state = this.getState();
    return this.streamConfig.enabledRoutes.some((pattern: RegExp) => pattern.test(state.currentRoute));
  }

  /**
   * Resolve the stream ID based on current route
   * Returns null if stream ID cannot be determined
   */
  private resolveStreamId() {
    // Home route: build from home store state
    if (this.state.currentRoute === APP_ROUTES.HOME) {
      const { sort, reach, content } = Core.useHomeStore.getState();
      this.streamState.currentStreamId = Core.getStreamId(sort, reach, content);
      Logger.debug('Built home stream ID', { homeStreamId: this.streamState.currentStreamId });
    }
    // Post route: extract from URL and build reply stream ID
    else if (this.state.currentRoute.startsWith(POST_ROUTES.POST)) {
      this.buildPostReplyStreamId();
    } else {
      this.streamState.currentStreamId = null;
    }
  }

  /**
   * Build post reply stream ID from current route
   * Pattern: postReplies:${userId}:${postId}
   */
  private buildPostReplyStreamId() {
    try {
      const params = this.extractPostParams(this.state.currentRoute);
      if (!params) {
        Logger.warn('Failed to extract post params from route', { route: this.state.currentRoute });
        this.streamState.currentStreamId = null;
        return;
      }

      const compositePostId = Core.buildCompositeId({ pubky: params.userId, id: params.postId });
      this.streamState.currentStreamId = Core.buildPostReplyStreamId(compositePostId);

      Logger.debug('Built post reply stream ID', { replyStreamId: this.streamState.currentStreamId });
    } catch (error) {
      Logger.error('Failed to build post reply stream ID', { error });
      this.streamState.currentStreamId = null;
    }
  }

  /**
   * Extract userId and postId from post route
   * Route pattern: /post/[userId]/[postId]
   */
  private extractPostParams(route: string): { userId: string; postId: string } | null {
    const match = route.match(/^\/post\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return null;
    }
    return {
      userId: match[1],
      postId: match[2],
    };
  }

  /**
   * Additional checks specific to stream coordinator for inactive reasons
   * Must be able to determine stream ID
   */
  protected getInactiveReasonAdditionalChecks(): PollingInactiveReason | null {
    if (!this.streamState.currentStreamId) {
      return PollingInactiveReason.INVALID_IDENTIFIER;
    }
    return null;
  }
}
