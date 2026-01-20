/**
 * Default delay in milliseconds before closing the popover when mouse leaves.
 *
 * This delay is essential to prevent the popover from flickering/blinking when
 * the user moves their mouse from the trigger element to the popover content.
 * Without this delay, there's a brief moment when the mouse has left the trigger
 * but hasn't yet entered the popover content, causing the popover to close
 * prematurely and reopen, resulting in a jarring visual experience.
 *
 * A 100ms delay provides enough time for the mouse to traverse the gap between
 * trigger and content while being imperceptible to the user.
 */
export const DEFAULT_HOVER_CLOSE_DELAY = 100;
