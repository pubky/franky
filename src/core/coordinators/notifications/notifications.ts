import * as Core from '@/core';
import { Env, Logger } from '@/libs';
import { AUTH_ROUTES } from '@/app/routes';
import type { PollingServiceConfig, PollingInactiveReason } from './notifications.types';

/**
 * Converts a route path to a regex pattern that matches routes starting with that path.
 * Escapes special regex characters and anchors to the start of the string.
 */
function routeToRegex(route: string): RegExp {
  // Escape special regex characters and anchor to start
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}`);
}

/**
 * NotificationCoordinator
 *
 * Centralized coordinator for managing notification polling lifecycle.
 * Handles authentication state, route changes, page visibility, and polling intervals.
 *
 * This is a singleton coordinator that should be accessed via getInstance().
 * Typically managed by CoordinatorsManager component in the app layout.
 *
 * The coordinator's only responsibility is to poll and update indexdb. UI components
 * query notification store using useNotificationStore to get the latest unread count.
 */
export class NotificationCoordinator {
  private static instance: NotificationCoordinator | null = null;

  // Configuration
  private config: Required<PollingServiceConfig> = {
    intervalMs: Env.NEXT_PUBLIC_NOTIFICATION_POLL_INTERVAL_MS,
    pollOnStart: Env.NEXT_PUBLIC_NOTIFICATION_POLL_ON_START,
    respectPageVisibility: Env.NEXT_PUBLIC_NOTIFICATION_RESPECT_PAGE_VISIBILITY,
    disabledRoutes: [
      routeToRegex('/onboarding'), // Matches all onboarding routes
      routeToRegex(AUTH_ROUTES.LOGOUT),
      routeToRegex(AUTH_ROUTES.SIGN_IN),
    ],
  };

  // State
  private intervalId: NodeJS.Timeout | null = null;
  private isManuallyStarted = false;
  private currentRoute = '';
  private isPageVisible = true;

  // Store unsubscribers
  private authStoreUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.setupListeners();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the singleton instance of NotificationCoordinator
   */
  public static getInstance(): NotificationCoordinator {
    if (!NotificationCoordinator.instance) {
      NotificationCoordinator.instance = new NotificationCoordinator();
    }
    return NotificationCoordinator.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (NotificationCoordinator.instance) {
      NotificationCoordinator.instance.destroy();
      NotificationCoordinator.instance = null;
    }
  }

  /**
   * Start the polling coordinator
   */
  public start(): void {
    this.isManuallyStarted = true;
    this.evaluateAndStartPolling();
    Logger.debug('NotificationCoordinator start requested');
  }

  /**
   * Stop the polling coordinator
   */
  public stop(): void {
    this.isManuallyStarted = false;
    this.stopPolling(Core.PollingInactiveReason.MANUALLY_STOPPED);
    Logger.debug('NotificationCoordinator stop requested');
  }

  /**
   * Set the current route (used to determine if polling should be active)
   */
  public setRoute(route: string): void {
    if (this.currentRoute !== route) {
      this.currentRoute = route;
      Logger.debug('NotificationCoordinator route changed', { route });
      this.evaluateAndStartPolling();
    }
  }

  /**
   * Cleanup and destroy the coordinator instance (useful for testing)
   */
  public destroy(): void {
    this.stop();
    this.removeListeners();
  }

  /**
   * Configure the polling coordinator at runtime.
   *
   * Updates polling settings (interval, disabled routes, etc.) without recreating the instance.
   * If the polling interval changes while polling is active, it will restart with the new interval.
   *
   * @param config - Partial configuration to merge with existing settings
   *
   * @example
   * ```typescript
   * coordinator.configure({ intervalMs: 10000 }); // Change to 10 second polling
   * coordinator.configure({ disabledRoutes: [/^\/admin/] }); // Add admin route
   * ```
   */
  public configure(config: Partial<PollingServiceConfig>): void {
    const oldInterval = this.config.intervalMs;
    this.config = { ...this.config, ...config };

    // If interval changed and we're currently polling, restart with new interval
    if (oldInterval !== this.config.intervalMs && this.intervalId) {
      this.restartPolling();
    }

    Logger.debug('NotificationCoordinator configured', { config: this.config });
  }

  // ============================================================================
  // Private API
  // ============================================================================

  /**
   * Setup event listeners for auth state, page visibility, etc.
   */
  private setupListeners(): void {
    // Listen to auth store changes
    this.authStoreUnsubscribe = Core.useAuthStore.subscribe((state, prevState) => {
      if (state.isAuthenticated !== prevState.isAuthenticated) {
        Logger.debug('Auth state changed', {
          isAuthenticated: state.isAuthenticated,
        });
        this.evaluateAndStartPolling();
      }
    });

    // Listen to page visibility changes (browser tab active/inactive)
    // Browser automatically dispatches 'visibilitychange' when user switches tabs
    // This allows us to pause polling when tab is hidden to save resources
    if (this.config.respectPageVisibility && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
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

    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /**
   * Handle page visibility change events
   */
  private handleVisibilityChange = (): void => {
    const isVisible = document.visibilityState === 'visible';
    if (this.isPageVisible !== isVisible) {
      this.isPageVisible = isVisible;
      Logger.debug('Page visibility changed', { isVisible });
      this.evaluateAndStartPolling();
    }
  };

  /**
   * Evaluate conditions and start/stop polling accordingly
   */
  private evaluateAndStartPolling(): void {
    if (this.shouldPoll()) {
      this.startPolling();
    } else {
      const reason = this.getInactiveReason();
      this.stopPolling(reason);
    }
  }

  /**
   * Determine if polling should be active based on current conditions
   */
  private shouldPoll(): boolean {
    // Must be manually started
    if (!this.isManuallyStarted) {
      return false;
    }

    // Must be authenticated
    const authState = Core.useAuthStore.getState();
    if (!authState.isAuthenticated) {
      return false;
    }

    // Must have a valid userId to poll
    const userId = authState.currentUserPubky;
    if (!userId) {
      return false;
    }

    // Must not be on a disabled route
    if (this.isRouteDisabled()) {
      return false;
    }

    // Must have visible page (if configured to respect visibility)
    if (this.config.respectPageVisibility && !this.isPageVisible) {
      return false;
    }

    return true;
  }

  /**
   * Start the polling interval
   */
  private startPolling(): void {
    // Already polling
    if (this.intervalId) {
      return;
    }

    Logger.debug('Starting notification polling', {
      intervalMs: this.config.intervalMs,
    });

    // Poll immediately if configured
    if (this.config.pollOnStart) {
      this.poll();
    }

    // Start interval
    this.intervalId = setInterval(() => {
      this.poll();
    }, this.config.intervalMs);
  }

  /**
   * Execute a single poll operation
   */
  private async poll(): Promise<void> {
    try {
      // Get current user ID
      const userId = Core.useAuthStore.getState().selectCurrentUserPubky();

      Logger.debug('Polling notifications', { userId });

      // Coordinator calls controller to fetch notifications
      await Core.UserController.notifications({ userId });
    } catch (error) {
      Logger.error('Error polling notifications', { error });
      // Don't stop polling on error - just log and continue
    }
  }

  /**
   * Stop the polling interval
   */
  private stopPolling(reason: PollingInactiveReason): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Logger.debug('Stopped notification polling', { reason });
    }
  }

  /**
   * Restart polling (used when config changes)
   */
  private restartPolling(): void {
    if (this.intervalId) {
      this.stopPolling(Core.PollingInactiveReason.NOT_STARTED);
      this.startPolling();
    }
  }

  /**
   * Check if current route is in the disabled routes list
   */
  private isRouteDisabled(): boolean {
    return this.config.disabledRoutes.some((pattern) => pattern.test(this.currentRoute));
  }

  /**
   * Get the reason why polling is inactive
   */
  private getInactiveReason(): PollingInactiveReason {
    if (!this.isManuallyStarted) {
      return Core.PollingInactiveReason.NOT_STARTED;
    }

    const authState = Core.useAuthStore.getState();
    if (!authState.isAuthenticated) {
      return Core.PollingInactiveReason.NOT_AUTHENTICATED;
    }

    const userId = authState.currentUserPubky;
    if (!userId) {
      return Core.PollingInactiveReason.NOT_AUTHENTICATED;
    }

    if (this.isRouteDisabled()) {
      return Core.PollingInactiveReason.ROUTE_DISABLED;
    }

    if (this.config.respectPageVisibility && !this.isPageVisible) {
      return Core.PollingInactiveReason.PAGE_INACTIVE;
    }

    return Core.PollingInactiveReason.MANUALLY_STOPPED;
  }
}
