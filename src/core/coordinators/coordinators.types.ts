/**
 * Shared Coordinator Types
 *
 * Common type definitions used across all coordinator implementations.
 * Coordinators are system-initiated components that manage background
 * behaviors like polling, syncing, and cache updates.
 */

/**
 * Base internal state for polling coordinators
 * 
 * This represents the common state managed internally by all polling coordinators.
 */
export interface PollingServiceState {
  /**
   * The interval timer ID (null if not polling)
   */
  intervalId: NodeJS.Timeout | null;

  /**
   * Whether the coordinator was manually started
   */
  isManuallyStarted: boolean;

  /**
   * Current route being monitored
   */
  currentRoute: string;

  /**
   * Whether the page is currently visible
   */
  isPageVisible: boolean;
}

/**
 * Common reasons why polling might be inactive across all coordinators
 */
export enum PollingInactiveReason {
  /**
   * User is not authenticated
   */
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',

  /**
   * Current route does not support polling
   */
  ROUTE_DISABLED = 'ROUTE_DISABLED',

  /**
   * Page/tab is hidden or user is inactive
   */
  PAGE_INACTIVE = 'PAGE_INACTIVE',

  /**
   * Manually stopped via stop() method
   */
  MANUALLY_STOPPED = 'MANUALLY_STOPPED',

  /**
   * Service not yet started
   */
  NOT_STARTED = 'NOT_STARTED',

  /**
   * Unable to determine necessary identifiers (e.g., stream ID, user ID)
   */
  INVALID_IDENTIFIER = 'INVALID_IDENTIFIER',
}

/**
 * Base configuration options for polling coordinators
 */
export interface PollingServiceConfig {
  /**
   * Polling interval in milliseconds
   */
  intervalMs?: number;

  /**
   * Whether to poll immediately on start
   * @default true
   */
  pollOnStart?: boolean;

  /**
   * Whether to respect page visibility (stop polling when tab hidden)
   * @default true
   */
  respectPageVisibility?: boolean;
}

/**
 * Options for initializing a coordinator instance
 */
export interface CoordinatorInitOptions<
  Config extends PollingServiceConfig,
  State extends PollingServiceState,
> {
  /**
   * Initial configuration to merge with defaults
   */
  initialConfig?: Partial<Config>;
  /**
   * Initial state to merge with defaults
   */
  initialState?: Partial<State>;
}

