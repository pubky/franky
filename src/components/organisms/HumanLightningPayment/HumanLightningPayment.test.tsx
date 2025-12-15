import { describe, it, expect, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { Homegate } from '@/core/services/homegate';
import { HumanLightningPayment } from './HumanLightningPayment';

vi.mock('@/core/application/homegate', () => ({
  Homegate: {
    requestLightningInvoice: vi.fn().mockResolvedValue('mock-invoice'),
  },
}));

describe('HumanLightningPayment', () => {
  it('requests a lightning invoice on mount', async () => {
    render(<HumanLightningPayment onBack={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(Homegate.requestLightningInvoice).toHaveBeenCalledTimes(1);
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
