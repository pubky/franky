import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VerificationHandler } from './HumanLightningPayment.utils';
import { HomegateController } from '@/core';

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    HomegateController: {
      createLnVerification: vi.fn(),
      awaitLnVerification: vi.fn(),
    },
  };
});

describe('VerificationHandler', () => {
  const mockCreateLnVerification = HomegateController.createLnVerification as ReturnType<typeof vi.fn>;
  const mockAwaitLnVerification = HomegateController.awaitLnVerification as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: verification not expired (expires in 10 minutes)
    mockCreateLnVerification.mockResolvedValue({
      id: 'test-verification-id',
      bolt11Invoice: 'lnbc1000...',
      amountSat: 1000,
      expiresAt: Date.now() + 600000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('visibility change handling (mobile background/foreground)', () => {
    it('should re-check payment status when tab becomes visible after being in background', async () => {
      // Simulate: long-polling hangs indefinitely (simulating browser throttling in background)
      // The ONLY way to detect payment is via visibility change check

      let isVisibilityCheck = false;

      mockAwaitLnVerification.mockImplementation(async () => {
        if (isVisibilityCheck) {
          // Visibility check: payment confirmed
          return {
            success: true,
            data: {
              isPaid: true,
              signupCode: 'signup-code-123',
              homeserverPubky: 'homeserver-pubky-456',
            },
          };
        }
        // Long-poll: hang forever (simulate browser background throttling)
        return new Promise(() => {});
      });

      const onPaymentConfirmed = vi.fn();
      const onPaymentExpired = vi.fn();

      const handler = await VerificationHandler.create(onPaymentConfirmed, onPaymentExpired);

      // Wait a tick for the polling to start (and hang)
      await new Promise((resolve) => setTimeout(resolve, 10));

      // At this point, onPaymentConfirmed should NOT have been called
      // because the long-poll is hanging
      expect(onPaymentConfirmed).not.toHaveBeenCalled();

      // Now simulate: user returns to the tab (visibility change)
      // Mark that the next call is from visibility check
      isVisibilityCheck = true;

      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait for the visibility check to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // The payment should be confirmed via the visibility change check
      // This will FAIL without the fix because there's no visibility listener
      expect(onPaymentConfirmed).toHaveBeenCalledWith('signup-code-123', 'homeserver-pubky-456');

      handler.abort();
    });

    it('should only call onPaymentConfirmed once even if both polling and visibility check detect payment', async () => {
      // Both the long-poll and visibility check return payment confirmed simultaneously
      mockAwaitLnVerification.mockResolvedValue({
        success: true,
        data: {
          isPaid: true,
          signupCode: 'signup-code-123',
          homeserverPubky: 'homeserver-pubky-456',
        },
      });

      const onPaymentConfirmed = vi.fn();
      const onPaymentExpired = vi.fn();

      const handler = await VerificationHandler.create(onPaymentConfirmed, onPaymentExpired);

      // Trigger visibility change while polling is also running
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait for both to potentially complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should only be called once, not twice
      expect(onPaymentConfirmed).toHaveBeenCalledTimes(1);

      handler.abort();
    });

    it('should clean up visibility listener on abort', async () => {
      mockAwaitLnVerification.mockResolvedValue({ success: false, timeout: true });

      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const handler = await VerificationHandler.create(vi.fn(), vi.fn());
      handler.abort();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });
});
