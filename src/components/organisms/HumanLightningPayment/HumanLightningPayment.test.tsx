import { describe, it, expect, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { HomegateController } from '@/core';
import { HumanLightningPayment } from './HumanLightningPayment';

vi.mock('@/hooks/useSatUsdRate', () => ({
  useBtcRate: () => ({ satUsd: 0.0005 }),
}));

vi.mock('@/core', async () => {
  const actual = await vi.importActual('@/core');
  return {
    ...actual,
    HomegateController: {
      createLnVerification: vi.fn().mockResolvedValue({
        id: 'mock-id',
        bolt11Invoice: 'mock-invoice',
        amountSat: 1000,
        expiresAt: Date.now() - 1000, // Already expired so polling loop exits immediately
      }),
      awaitLnVerification: vi.fn().mockResolvedValue({
        success: false,
        timeout: true, // Return timeout so polling continues but exits due to expiration
      }),
    },
  };
});

describe('HumanLightningPayment', () => {
  it('requests a lightning invoice on mount', async () => {
    render(<HumanLightningPayment onBack={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(HomegateController.createLnVerification).toHaveBeenCalledTimes(1);
    });
  });

  it('on back', async () => {
    let isBackClicked = false;
    const { container } = render(
      <HumanLightningPayment
        onBack={() => {
          isBackClicked = true;
        }}
        onSuccess={() => {}}
      />,
    );
    fireEvent.click(container.querySelector('#human-phone-back-btn')!);

    await waitFor(() => {
      expect(isBackClicked).toBe(true);
    });
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanLightningPayment onBack={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
