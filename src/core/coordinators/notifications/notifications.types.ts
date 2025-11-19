/**
 * Notification Polling Service Types
 *
 * Type definitions for the notification polling service layer.
 */

/**
 * Callback function type for polling state change listeners
 */
export type PollingStateChangeListener = (state: PollingState) => void;

/**
 * Current state of the polling service
 */
export interface PollingState {
  /**
   * Whether polling is currently active
   */
  isPolling: boolean;

  /**
   * Timestamp of last successful poll (null if never polled)
   */
  lastPollTime: number | null;

  /**
   * Current polling interval in milliseconds
   */
  intervalMs: number;

  /**
   * Reason why polling is inactive (null if polling is active)
   */
  inactiveReason: PollingInactiveReason | null;
}

/**
 * Reasons why polling might be inactive
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
}

/**
 * Configuration options for the polling service
 */
export interface PollingServiceConfig {
  /**
   * Polling interval in milliseconds
   * @default 20000 (20 seconds)
   */
  intervalMs?: number;

  /**
   * Whether to poll immediately on start
   * @default true
   */
  pollOnStart?: boolean;

  /**
   * Routes where polling should be disabled (regex patterns)
   * @default [/^\/onboarding/, /^\/logout/]
   */
  disabledRoutes?: RegExp[];

  /**
   * Whether to respect page visibility (stop polling when tab hidden)
   * @default true
   */
  respectPageVisibility?: boolean;
}

