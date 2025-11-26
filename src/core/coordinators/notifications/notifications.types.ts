/**
 * Notification Polling Coordinator Types
 *
 * Type definitions for the notification polling coordinator.
 * Extends common coordinator types with notification-specific configuration.
 */

import { type PollingServiceConfig, type PollingServiceState } from '../coordinators.types';

/**
 * Notification coordinator internal state
 *
 * Extends base polling state with notification-specific properties.
 */
export type NotificationCoordinatorState = PollingServiceState;

/**
 * Configuration options for the notification polling coordinator
 */
export interface NotificationCoordinatorConfig extends PollingServiceConfig {
  /**
   * Polling interval in milliseconds
   * @default 88000 (88 seconds)
   */
  intervalMs?: number;

  /**
   * Routes where polling should be disabled (regex patterns)
   * @default [/^\/onboarding/, /^\/logout/, /^\/sign-in/]
   */
  disabledRoutes?: RegExp[];
}
