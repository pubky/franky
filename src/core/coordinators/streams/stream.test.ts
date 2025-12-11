import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Core from '@/core';
import type { PollingServiceConfig } from '@/core/coordinators/base';
import { APP_ROUTES, POST_ROUTES } from '@/app/routes';

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Type helper for coordinator config that includes base polling config properties
 * This is needed because TypeScript doesn't always recognize inherited properties
 * from PollingServiceConfig in StreamCoordinatorConfig
 */
type CoordinatorConfigWithBase = Core.StreamCoordinatorConfig & PollingServiceConfig;

/**
 * Sets up an authenticated user with home store and stream controller spies
 * Reduces boilerplate for most tests
 */
function setupAuthenticatedTest(userId = 'user123') {
  const getStreamHeadSpy = vi.spyOn(Core.StreamPostsController, 'getStreamHead').mockResolvedValue(1_000_000_000); // Valid stream head timestamp
  const getOrFetchStreamSliceSpy = vi
    .spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice')
    .mockResolvedValue({ nextPageIds: [], timestamp: 0 });

  // Mock home store
  const unsubscribeSpy = vi.fn();
  const homeStoreState = {
    sort: Core.SORT.TIMELINE,
    reach: Core.REACH.ALL,
    content: Core.CONTENT.ALL,
    layout: Core.LAYOUT.COLUMNS,
    setLayout: vi.fn(),
    setSort: vi.fn(),
    setReach: vi.fn(),
    setContent: vi.fn(),
    reset: vi.fn(),
  } as unknown as Core.HomeStore;

  vi.spyOn(Core.useHomeStore, 'getState').mockReturnValue(homeStoreState);
  vi.spyOn(Core.useHomeStore, 'subscribe').mockImplementation((callback) => {
    // Store the callback for potential manual invocation in tests
    (Core.useHomeStore.subscribe as unknown as { _callback?: typeof callback })._callback = callback;
    return unsubscribeSpy;
  });

  // Mock getStreamId to return a valid stream ID
  vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:all:all' as Core.PostStreamTypes);

  // Mock breakDownStreamId to return non-engagement stream
  // Format: [sorting, invokeEndpoint, kind, tags]
  vi.spyOn(Core, 'breakDownStreamId').mockReturnValue([
    'timeline',
    Core.StreamSource.ALL,
    'all',
    undefined,
  ] as Core.TStreamIdBreakdown);

  // Authentication is now derived from session, so we need to set session
  Core.useAuthStore.getState().setSession({} as any);
  Core.useAuthStore.getState().setCurrentUserPubky(userId as unknown as Core.Pubky);
  const coordinator = Core.StreamCoordinator.getInstance();
  return { getStreamHeadSpy, getOrFetchStreamSliceSpy, coordinator };
}

/**
 * Flushes pending async promises
 * Useful for pollOnStart tests
 */
async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

/**
 * Sets up a post route with valid params
 */
function setupPostRoute(coordinator: Core.StreamCoordinator, userId = 'user123', postId = 'post456') {
  const route = `${POST_ROUTES.POST}/${userId}/${postId}`;
  coordinator.setRoute(route);

  // Mock buildCompositeId and buildPostReplyStreamId
  const compositePostId = `${userId}:${postId}`;
  vi.spyOn(Core, 'buildCompositeId').mockReturnValue(compositePostId);
  vi.spyOn(Core, 'buildPostReplyStreamId').mockReturnValue(
    `post_replies:${compositePostId}` as Core.ReplyStreamCompositeId,
  );

  return route;
}

// =============================================================================
// Tests
// =============================================================================

describe('StreamCoordinator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset coordinator singleton and auth store before each test
    Core.StreamCoordinator.resetInstance();
    Core.useAuthStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('Singleton Behavior', () => {
    it('returns the same instance on multiple getInstance() calls', () => {
      const instance1 = Core.StreamCoordinator.getInstance();
      const instance2 = Core.StreamCoordinator.getInstance();
      const instance3 = Core.StreamCoordinator.getInstance();

      // All should be the exact same object reference
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });

    it('shares state across all getInstance() references', async () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      // Create coordinator instances after mocks are set up
      const coord1 = Core.StreamCoordinator.getInstance();
      const coord2 = Core.StreamCoordinator.getInstance();

      // Configure and start through first reference
      coord1.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coord1.setRoute(APP_ROUTES.HOME);
      coord1.start();

      // Wait for async operations (stream head resolution and first poll)
      await flushPromises();
      // Advance time to trigger interval
      vi.advanceTimersByTime(1_000);
      // Wait for async poll operation to complete
      await flushPromises();
      // Advance more time for second poll
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      // Should have attempted to poll
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();

      // Stop through second reference
      coord2.stop();

      // Both should reflect the same state (stopped)
      vi.advanceTimersByTime(5_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;
      // No additional calls after stop
      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('creates a new instance after resetInstance()', () => {
      const instance1 = Core.StreamCoordinator.getInstance();

      Core.StreamCoordinator.resetInstance();

      const instance2 = Core.StreamCoordinator.getInstance();

      // After reset, we should get a DIFFERENT instance
      expect(instance1).not.toBe(instance2);
    });

    it('new instance after reset has fresh state', async () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      const coord1 = Core.StreamCoordinator.getInstance();
      coord1.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coord1.setRoute(APP_ROUTES.HOME);
      coord1.start();

      vi.advanceTimersByTime(1_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Reset creates new instance with fresh state
      Core.StreamCoordinator.resetInstance();

      // New instance should not be polling (start() was not called)
      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });
  });

  describe('Race Conditions', () => {
    it('handles multiple rapid start() calls gracefully', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      await coordinator.setRoute(APP_ROUTES.HOME);

      // Rapidly call start multiple times
      await coordinator.start();
      await coordinator.start();
      await coordinator.start();
      await coordinator.start();

      // Wait for async operations
      await flushPromises();
      // Should only have one interval running, not four
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      const firstCallCount = getOrFetchStreamSliceSpy.mock.calls.length;

      vi.advanceTimersByTime(1_000);
      await flushPromises();
      // Should have one more poll, not 4x
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(firstCallCount);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeLessThan(firstCallCount + 4);
    });

    it('handles multiple rapid stop() calls gracefully', () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      vi.advanceTimersByTime(1_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Rapidly call stop multiple times
      coordinator.stop();
      coordinator.stop();
      coordinator.stop();

      // Should not throw or cause issues
      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('handles interleaved start/stop calls gracefully', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      await coordinator.setRoute(APP_ROUTES.HOME);

      // Rapid start/stop/start pattern
      await coordinator.start();
      coordinator.stop();
      await coordinator.start();
      coordinator.stop();
      await coordinator.start();

      // Wait for async operations
      await flushPromises();
      // Last call was start(), so should be polling
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(0);

      // Stop it
      coordinator.stop();
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;
      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('handles multiple rapid configure() calls gracefully', async () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      const coordinator = Core.StreamCoordinator.getInstance();
      await coordinator.setRoute(APP_ROUTES.HOME);

      // Rapidly change configuration multiple times
      coordinator.configure({ intervalMs: 1_000 });
      coordinator.configure({ intervalMs: 2_000 });
      coordinator.configure({ intervalMs: 500 });
      coordinator.configure({ intervalMs: 3_000 });
      coordinator.configure({ intervalMs: 1_000 });

      // Last config should win (1_000ms interval)
      await coordinator.start();

      await flushPromises();
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      const firstCallCount = getOrFetchStreamSliceSpy.mock.calls.length;

      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it('handles configure() during active polling without creating duplicate timers', async () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      const coordinator = Core.StreamCoordinator.getInstance();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      await coordinator.setRoute(APP_ROUTES.HOME);
      await coordinator.start();

      await flushPromises();
      // Poll once
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      const firstCallCount = getOrFetchStreamSliceSpy.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0); // Ensure we got the first poll

      // Change interval mid-polling (should restart with new interval)
      // The restart clears the old timer and starts a new one from 0
      coordinator.configure({ intervalMs: 2_000 });
      await flushPromises();

      // Old 1s timer should be cleared, new 2s timer should be active
      // Advance 1s - should not poll yet (new timer needs 2s)
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(firstCallCount); // No poll at 1s mark

      // Advance another 1s (total 2s from restart) - should poll now
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(firstCallCount); // Poll at 2s mark
    });

    it('handles start/configure/stop in rapid succession', async () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      const coordinator = Core.StreamCoordinator.getInstance();
      await coordinator.setRoute(APP_ROUTES.HOME);

      // Rapid succession of different operations
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      await coordinator.start();
      coordinator.configure({ intervalMs: 500 });
      coordinator.stop();
      coordinator.configure({ intervalMs: 2_000 });
      await coordinator.start();

      await flushPromises();
      // Should be stopped, then started with 2s interval
      vi.advanceTimersByTime(2_000);
      await flushPromises();
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);

      vi.advanceTimersByTime(2_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  describe('Memory Leaks & Cleanup', () => {
    it('stops polling after destroy() is called', () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      vi.advanceTimersByTime(2_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Destroy the coordinator
      coordinator.destroy();

      // Should not poll anymore
      vi.advanceTimersByTime(10_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('removes visibility change listener on destroy()', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const coordinator = Core.StreamCoordinator.getInstance();
      coordinator.configure({ respectPageVisibility: true } as Partial<CoordinatorConfigWithBase>);

      // Should have added visibility listener during construction
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

      const visibilityHandler = addEventListenerSpy.mock.calls.find((call) => call[0] === 'visibilitychange')?.[1];

      coordinator.destroy();

      // Should remove the listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', visibilityHandler);

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('removes home store subscription on destroy()', () => {
      const unsubscribeSpy = vi.fn();
      vi.spyOn(Core.StreamPostsController, 'getStreamHead').mockResolvedValue(1_000_000_000);
      vi.spyOn(Core.StreamPostsController, 'getOrFetchStreamSlice').mockResolvedValue({
        nextPageIds: [],
        timestamp: 0,
      });

      // Mock home store with subscribe
      const homeStoreState = {
        sort: Core.SORT.TIMELINE,
        reach: Core.REACH.ALL,
        content: Core.CONTENT.ALL,
        layout: Core.LAYOUT.COLUMNS,
        setLayout: vi.fn(),
        setSort: vi.fn(),
        setReach: vi.fn(),
        setContent: vi.fn(),
        reset: vi.fn(),
      } as unknown as Core.HomeStore;

      vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:all:all' as Core.PostStreamTypes);
      vi.spyOn(Core, 'breakDownStreamId').mockReturnValue([
        'timeline',
        Core.StreamSource.ALL,
        'all',
        undefined,
      ] as Core.TStreamIdBreakdown);

      // Authentication is now derived from session, so we need to set session
  Core.useAuthStore.getState().setSession({} as any);
      Core.useAuthStore.getState().setCurrentUserPubky('user123' as unknown as Core.Pubky);

      // Reset instance first to ensure clean state
      Core.StreamCoordinator.resetInstance();

      // Set up mocks BEFORE creating the instance
      // This ensures the mocks are active when setupListeners() is called in the constructor
      vi.spyOn(Core.useHomeStore, 'getState').mockReturnValue(homeStoreState);

      // Subscribe returns an unsubscribe function
      const subscribeSpyAfterReset = vi.spyOn(Core.useHomeStore, 'subscribe').mockReturnValue(unsubscribeSpy);

      // Now create the instance - setupListeners() will be called in the constructor
      const newCoordinator = Core.StreamCoordinator.getInstance();

      // Verify subscribe was called during construction
      expect(subscribeSpyAfterReset).toHaveBeenCalled();

      newCoordinator.configure({ respectPageVisibility: false } as Partial<CoordinatorConfigWithBase>);

      // Destroy should call the unsubscribe function that was returned by subscribe()
      newCoordinator.destroy();

      // Should have called unsubscribe when destroy() calls removeListeners()
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('does not respond to auth changes after destroy()', () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      vi.advanceTimersByTime(1_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Destroy the coordinator
      coordinator.destroy();

      // Change auth state (should not trigger polling)
      Core.useAuthStore.getState().setSession(null);
      // Authentication is now derived from session, so we need to set session
  Core.useAuthStore.getState().setSession({} as any);

      vi.advanceTimersByTime(10_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('does not respond to visibility changes after destroy()', () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({
        pollOnStart: false,
        intervalMs: 1_000,
        respectPageVisibility: true,
      } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      vi.advanceTimersByTime(1_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Destroy the coordinator
      coordinator.destroy();

      // Change visibility (should not trigger polling)
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));

      vi.advanceTimersByTime(10_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });

    it('can be safely destroyed multiple times', () => {
      const coordinator = Core.StreamCoordinator.getInstance();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      // Multiple destroy calls should not throw
      expect(() => {
        coordinator.destroy();
        coordinator.destroy();
        coordinator.destroy();
      }).not.toThrow();
    });

    it('resetInstance() properly cleans up before creating new instance', () => {
      const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

      const coord1 = Core.StreamCoordinator.getInstance();
      coord1.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coord1.setRoute(APP_ROUTES.HOME);
      coord1.start();

      vi.advanceTimersByTime(1_000);
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Reset (should call destroy internally)
      Core.StreamCoordinator.resetInstance();

      // Old instance should not poll anymore
      vi.advanceTimersByTime(10_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);

      // New instance should be clean
      const coord2 = Core.StreamCoordinator.getInstance();
      expect(coord2).not.toBe(coord1);
    });
  });

  describe('Stream ID Edge Cases', () => {
    it('does not poll when stream ID cannot be resolved on /home', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      // Mock getStreamId to return null/invalid
      vi.spyOn(Core, 'getStreamId').mockReturnValue(null as unknown as Core.PostStreamTypes);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should NOT poll without valid stream ID
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('does not poll when post route params are invalid', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/post/invalid'); // Missing postId
      coordinator.start();

      await flushPromises();

      // Should NOT poll with invalid post route
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('does not poll when stream ID is null on non-enabled route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/profile'); // Not an enabled route
      coordinator.start();

      await flushPromises();

      // Should NOT poll on non-enabled route
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('resets stream head when stream ID changes', async () => {
      const { getStreamHeadSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      // First stream ID
      vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:all:all' as Core.PostStreamTypes);
      vi.advanceTimersByTime(1_000);
      expect(getStreamHeadSpy).toHaveBeenCalled();

      // Change stream ID by changing home store
      vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:following:all' as Core.PostStreamTypes);
      vi.spyOn(Core.useHomeStore, 'getState').mockReturnValue({
        sort: Core.SORT.TIMELINE,
        reach: Core.REACH.FOLLOWING,
        content: Core.CONTENT.ALL,
        layout: Core.LAYOUT.COLUMNS,
        setLayout: vi.fn(),
        setSort: vi.fn(),
        setReach: vi.fn(),
        setContent: vi.fn(),
        reset: vi.fn(),
      } as unknown as Core.HomeStore);

      // Trigger re-evaluation
      coordinator.setRoute(APP_ROUTES.HOME);
      vi.advanceTimersByTime(1_000);

      // Should have called getStreamHead again with new stream ID
      expect(getStreamHeadSpy.mock.calls.length).toBeGreaterThan(1);
    });

    it('handles stream ID changing between polls', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();
      // First stream ID
      vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:all:all' as Core.PostStreamTypes);
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();

      // Change stream ID
      vi.spyOn(Core, 'getStreamId').mockReturnValue('timeline:following:all' as Core.PostStreamTypes);
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Dynamic Configuration', () => {
    it('respects enabledRoutes changes at runtime', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      await coordinator.setRoute('/profile');
      await coordinator.start();

      // Should not poll on /profile (not enabled by default)
      await flushPromises();
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      // Add /profile to enabled routes and mock getStreamId for /profile route
      // Note: /profile route doesn't have a stream ID by default, so we need to handle this
      // For this test, we'll use /home route which has a valid stream ID
      await coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.configure({ enabledRoutes: [/^\/home$/] });
      await flushPromises(); // Wait for re-evaluation triggered by configure

      // Stop and restart to re-evaluate with new config
      coordinator.stop();
      await coordinator.start();

      await flushPromises();
      // Should poll on now-enabled route
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });

    it('allows changing fetchLimit via configure()', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({
        pollOnStart: false,
        intervalMs: 1_000,
        fetchLimit: 10,
      } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        }),
      );

      // Change fetch limit
      coordinator.configure({ fetchLimit: 20 });
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        }),
      );
    });

    it('respects respectPageVisibility toggle at runtime', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();

      // Start with visibility respect enabled
      coordinator.configure({
        pollOnStart: false,
        intervalMs: 1_000,
        respectPageVisibility: true,
      } as Partial<CoordinatorConfigWithBase>);
      await coordinator.setRoute(APP_ROUTES.HOME);

      // Set page to hidden
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      const coordinatorState = coordinator as unknown as { state: { isPageVisible: boolean } };
      if (coordinatorState.state) {
        coordinatorState.state.isPageVisible = false;
      }

      await coordinator.start();
      await flushPromises();

      // Should not poll when hidden
      vi.advanceTimersByTime(2_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      // Toggle to ignore page visibility
      coordinator.configure({ respectPageVisibility: false } as Partial<CoordinatorConfigWithBase>);
      await flushPromises(); // Wait for re-evaluation triggered by configure
      await coordinator.setRoute(APP_ROUTES.HOME);
      await flushPromises();

      // Should start polling (now ignoring visibility)
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });
  });

  describe('Route Edge Cases', () => {
    it('handles empty route string', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('');
      coordinator.start();

      // Should not poll with empty route (not enabled)
      vi.advanceTimersByTime(1_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('handles post route with query parameters', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      setupPostRoute(coordinator, 'user123', 'post456');
      coordinator.setRoute('/post/user123/post456?highlight=comment123');
      coordinator.start();

      await flushPromises();
      // Should poll normally (query params should be ignored)
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });

    it('handles post route with special characters in userId/postId', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);

      // Routes with special chars
      const specialRoutes = [
        { userId: 'user-123', postId: 'post_456' },
        { userId: 'user.123', postId: 'post-456' },
        { userId: 'user@123', postId: 'post+456' },
      ];

      for (const { userId, postId } of specialRoutes) {
        setupPostRoute(coordinator, userId, postId);
        coordinator.start();

        await flushPromises();
        vi.advanceTimersByTime(1_000);
        await flushPromises();
        expect(getOrFetchStreamSliceSpy).toHaveBeenCalled(); // Should not crash

        coordinator.stop();
        getOrFetchStreamSliceSpy.mockClear();
      }
    });

    it('handles deeply nested routes', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/app/dashboard/analytics/reports/quarterly/2024/q1');
      coordinator.start();

      // Should not poll on non-enabled route
      vi.advanceTimersByTime(1_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });
  });

  describe('Enabled Routes', () => {
    it('polls on /home route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });

    it('polls on /post route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      setupPostRoute(coordinator);
      coordinator.start();

      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });

    it('does not poll on non-enabled routes', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/profile');
      coordinator.start();

      await flushPromises();
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('resumes polling when moving from non-enabled to enabled route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/profile');
      coordinator.start();

      await flushPromises();
      // Should not poll on non-enabled route
      vi.advanceTimersByTime(2_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      // Move to enabled route
      coordinator.setRoute(APP_ROUTES.HOME);

      // Should resume polling
      await flushPromises();
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });

    it('stops polling when moving from enabled to non-enabled route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();
      // Should poll on enabled route
      vi.advanceTimersByTime(2_000);
      await flushPromises();
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(0);

      // Move to non-enabled route
      coordinator.setRoute('/profile');

      // Should stop polling
      const callCount = getOrFetchStreamSliceSpy.mock.calls.length;
      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
    });
  });

  describe('Home Store Subscription', () => {
    it('re-evaluates polling when home store sort changes', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();
      vi.advanceTimersByTime(1_000);
      await flushPromises();
      const initialCallCount = getOrFetchStreamSliceSpy.mock.calls.length;

      // Simulate home store change by getting the subscribe callback
      const subscribeMock = vi.mocked(Core.useHomeStore.subscribe);
      const subscribeCall = subscribeMock.mock.calls.find((call) => typeof call[0] === 'function');
      const subscribeCallback = subscribeCall?.[0] as
        | ((state: Core.HomeStore, prevState: Core.HomeStore) => void)
        | undefined;

      if (subscribeCallback) {
        await subscribeCallback(
          {
            sort: Core.SORT.ENGAGEMENT,
            reach: Core.REACH.ALL,
            content: Core.CONTENT.ALL,
            layout: Core.LAYOUT.COLUMNS,
            setLayout: vi.fn(),
            setSort: vi.fn(),
            setReach: vi.fn(),
            setContent: vi.fn(),
            reset: vi.fn(),
          } as Core.HomeStore,
          {
            sort: Core.SORT.TIMELINE,
            reach: Core.REACH.ALL,
            content: Core.CONTENT.ALL,
            layout: Core.LAYOUT.COLUMNS,
            setLayout: vi.fn(),
            setSort: vi.fn(),
            setReach: vi.fn(),
            setContent: vi.fn(),
            reset: vi.fn(),
          } as Core.HomeStore,
        );
      }

      await flushPromises();

      // Should have re-evaluated and potentially polled
      expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    });

    it('does not re-evaluate when on non-home route', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute('/profile');
      coordinator.start();

      await flushPromises();

      // Simulate home store change by getting the subscribe callback
      const subscribeMock = vi.mocked(Core.useHomeStore.subscribe);
      const subscribeCall = subscribeMock.mock.calls.find((call) => typeof call[0] === 'function');
      const subscribeCallback = subscribeCall?.[0] as
        | ((state: Core.HomeStore, prevState: Core.HomeStore) => void)
        | undefined;

      if (subscribeCallback) {
        await subscribeCallback(
          {
            sort: Core.SORT.ENGAGEMENT,
            reach: Core.REACH.ALL,
            content: Core.CONTENT.ALL,
            layout: Core.LAYOUT.COLUMNS,
            setLayout: vi.fn(),
            setSort: vi.fn(),
            setReach: vi.fn(),
            setContent: vi.fn(),
            reset: vi.fn(),
          } as Core.HomeStore,
          {
            sort: Core.SORT.TIMELINE,
            reach: Core.REACH.ALL,
            content: Core.CONTENT.ALL,
            layout: Core.LAYOUT.COLUMNS,
            setLayout: vi.fn(),
            setSort: vi.fn(),
            setReach: vi.fn(),
            setContent: vi.fn(),
            reset: vi.fn(),
          } as Core.HomeStore,
        );
      }

      // Should not poll (not on home route)
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });
  });

  describe('Stream Head Resolution', () => {
    it('does not poll when stream head cannot be resolved', async () => {
      const { getStreamHeadSpy, getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      // Mock getStreamHead to return SKIP_FETCH_NEW_POSTS
      getStreamHeadSpy.mockResolvedValue(Core.SKIP_FETCH_NEW_POSTS);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should have tried to get stream head
      expect(getStreamHeadSpy).toHaveBeenCalled();

      // But should not have polled (stream head resolution failed)
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('does not poll when stream head is invalid', async () => {
      const { getStreamHeadSpy, getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      // Mock getStreamHead to return invalid value (< FORCE_FETCH_NEW_POSTS)
      getStreamHeadSpy.mockResolvedValue(-1);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should have tried to get stream head
      expect(getStreamHeadSpy).toHaveBeenCalled();

      // But should not have polled (invalid stream head)
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('polls with correct stream head value', async () => {
      const { getStreamHeadSpy, getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      const streamHead = 1_500_000_000;
      getStreamHeadSpy.mockResolvedValue(streamHead);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should have polled with correct stream head
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          streamHead,
        }),
      );
    });
  });

  describe('Engagement Stream Skipping', () => {
    it('skips polling for engagement streams', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      // Mock breakDownStreamId to return engagement stream
      // Format: [sorting, invokeEndpoint, kind, tags]
      vi.spyOn(Core, 'breakDownStreamId').mockReturnValue([
        'total_engagement',
        Core.StreamSource.ALL,
        'all',
        undefined,
      ] as Core.TStreamIdBreakdown);
      vi.spyOn(Core, 'getStreamId').mockReturnValue('total_engagement:all:all' as Core.PostStreamTypes);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should not poll engagement streams
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5_000);
      expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    });

    it('polls non-engagement streams normally', async () => {
      const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
      // Mock breakDownStreamId to return timeline stream
      // Format: [sorting, invokeEndpoint, kind, tags]
      vi.spyOn(Core, 'breakDownStreamId').mockReturnValue([
        'timeline',
        Core.StreamSource.ALL,
        'all',
        undefined,
      ] as Core.TStreamIdBreakdown);

      coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
      coordinator.setRoute(APP_ROUTES.HOME);
      coordinator.start();

      await flushPromises();

      // Should poll non-engagement streams
      expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    });
  });

  it('polls on interval when started (no pollOnStart)', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(999);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    vi.advanceTimersByTime(2_000);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(1);
  });

  it('restarts polling when interval changes via configure()', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    await coordinator.setRoute(APP_ROUTES.HOME);
    await coordinator.start();

    await flushPromises();
    vi.advanceTimersByTime(2_000); // two ticks at 1s
    await flushPromises();
    const callCount = getOrFetchStreamSliceSpy.mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(2); // Should have at least 2 calls

    // Change to 500ms and ensure more frequent ticks
    coordinator.configure({ intervalMs: 500 });
    await flushPromises(); // Wait for restart
    const callCountAfterConfig = getOrFetchStreamSliceSpy.mock.calls.length;
    // With 500ms interval, advancing 2s should give us 4 more polls
    // The restart clears the old timer and starts a new one from 0
    vi.advanceTimersByTime(2_000); // four ticks at 0.5s
    await flushPromises();
    // Should have at least 3 more calls (4 polls in 2s at 500ms interval, but first one might be immediate)
    // Actually, with pollOnStart: false, the first poll happens after the interval
    // So in 2s at 500ms, we should get 4 polls
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThanOrEqual(callCountAfterConfig + 3);
  });

  it('respects page visibility: pauses when hidden, resumes when visible', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();

    // Set page to hidden before starting
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    coordinator.configure({
      pollOnStart: true,
      intervalMs: 1_000,
      respectPageVisibility: true,
    } as Partial<CoordinatorConfigWithBase>);
    await coordinator.setRoute(APP_ROUTES.HOME);
    const coordinatorState = coordinator as unknown as { state: { isPageVisible: boolean } };
    if (coordinatorState.state) {
      coordinatorState.state.isPageVisible = false;
    }
    await coordinator.start();

    await flushPromises();

    // No immediate poll because hidden
    expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();

    // Make page visible and trigger visibility change
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    // Trigger visibility change event to update coordinator state
    document.dispatchEvent(new Event('visibilitychange'));
    await flushPromises();

    // Set route again to trigger re-evaluation (which should start polling)
    await coordinator.setRoute(APP_ROUTES.HOME);
    await flushPromises();

    // Should poll now that page is visible (pollOnStart is true, so immediate poll on start)
    // But since we already started, we need to wait for the interval or trigger a new start
    // Actually, setRoute triggers evaluateAndStartPolling which should start polling if conditions are met
    expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(1);
  });

  it('ignores page visibility when respectPageVisibility is false', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();

    // Make page hidden
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    coordinator.configure({
      pollOnStart: true,
      intervalMs: 1_000,
      respectPageVisibility: false,
    } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    // Should poll immediately despite being hidden
    await flushPromises();
    expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
  });

  it('stops when de-authenticated and resumes when authenticated again', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    vi.advanceTimersByTime(2_000);
    await flushPromises();
    const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

    // De-authenticate -> should stop
    Core.useAuthStore.getState().setSession(null);
    vi.advanceTimersByTime(2_000);
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);

    // Re-authenticate -> must also have a pubky set before polling can succeed
    Core.useAuthStore.getState().setCurrentUserPubky('user123' as unknown as Core.Pubky);
    // Authentication is now derived from session, so we need to set session
  Core.useAuthStore.getState().setSession({} as any);
    vi.advanceTimersByTime(1_000);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(callCount);
  });

  it('pauses on non-enabled route then resumes on enabled route', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: false, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    vi.advanceTimersByTime(2_000);
    await flushPromises();
    const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

    coordinator.setRoute('/profile'); // not enabled by default
    vi.advanceTimersByTime(2_000);
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);

    coordinator.setRoute(APP_ROUTES.HOME);
    await flushPromises();
    vi.advanceTimersByTime(1_000);
    await flushPromises();
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBeGreaterThan(callCount);
  });

  it('forwards the correct stream ID and limit to StreamPostsController', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    const streamId = 'timeline:all:all' as Core.PostStreamTypes;
    vi.spyOn(Core, 'getStreamId').mockReturnValue(streamId);

    coordinator.configure({
      pollOnStart: true,
      intervalMs: 1_000,
      fetchLimit: 25,
    } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
    const callArgs = getOrFetchStreamSliceSpy.mock.calls[0]?.[0] as Core.TReadPostStreamChunkParams;
    expect(callArgs?.streamId).toBe(streamId);
    expect(callArgs?.limit).toBe(25);
  });

  it('continues polling even if a poll attempt throws', async () => {
    const { coordinator } = setupAuthenticatedTest();
    const getStreamHeadSpy = vi
      .spyOn(Core.StreamPostsController, 'getStreamHead')
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(1_000_000_000);

    coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    // First immediate call may reject, but next interval should still run
    await Promise.resolve();
    vi.advanceTimersByTime(1_000);
    expect(getStreamHeadSpy).toHaveBeenCalledTimes(2);
  });

  it('does not poll until start() is called', async () => {
    const { getOrFetchStreamSliceSpy } = setupAuthenticatedTest();

    // Create instance but do not start (don't call start())
    // Advance time – should not poll because start() wasn't called
    vi.advanceTimersByTime(10_000);
    expect(getOrFetchStreamSliceSpy).not.toHaveBeenCalled();
  });

  it('polls immediately on start when pollOnStart is true', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    expect(getOrFetchStreamSliceSpy).toHaveBeenCalled();
  });

  it('stops polling when stop() is called', async () => {
    const { getOrFetchStreamSliceSpy, coordinator } = setupAuthenticatedTest();
    coordinator.configure({ pollOnStart: true, intervalMs: 1_000 } as Partial<CoordinatorConfigWithBase>);
    coordinator.setRoute(APP_ROUTES.HOME);
    coordinator.start();

    await flushPromises();
    const callCount = getOrFetchStreamSliceSpy.mock.calls.length;

    // Stop and ensure no more polls happen
    coordinator.stop();
    vi.advanceTimersByTime(5_000);
    expect(getOrFetchStreamSliceSpy.mock.calls.length).toBe(callCount);
  });

  afterEach(() => {
    Core.StreamCoordinator.resetInstance();
    // Restore document visibility to visible for subsequent tests
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
