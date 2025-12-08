import * as Core from '@/core';

type MuteListener = (mutedUserId: Core.Pubky) => void;

/**
 * Simple event emitter for mute/unmute events.
 * Used to notify UI components when the mute list changes so they can update immediately.
 */
class MuteEventEmitter {
  private muteListeners: Set<MuteListener> = new Set();
  private unmuteListeners: Set<MuteListener> = new Set();

  /**
   * Subscribe to mute events
   * @returns Unsubscribe function
   */
  onMute(listener: MuteListener): () => void {
    this.muteListeners.add(listener);
    return () => this.muteListeners.delete(listener);
  }

  /**
   * Subscribe to unmute events
   * @returns Unsubscribe function
   */
  onUnmute(listener: MuteListener): () => void {
    this.unmuteListeners.add(listener);
    return () => this.unmuteListeners.delete(listener);
  }

  /**
   * Emit a mute event to all listeners
   */
  emitMute(mutedUserId: Core.Pubky): void {
    this.muteListeners.forEach((listener) => listener(mutedUserId));
  }

  /**
   * Emit an unmute event to all listeners
   */
  emitUnmute(unmutedUserId: Core.Pubky): void {
    this.unmuteListeners.forEach((listener) => listener(unmutedUserId));
  }
}

export const muteEvents = new MuteEventEmitter();
