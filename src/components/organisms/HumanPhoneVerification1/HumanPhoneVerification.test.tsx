import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanPhoneVerification1 } from './HumanPhoneVerification1';

vi.mock('@/molecules', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/molecules');

  return {
    ...actual,
    SmsVerificationCard: () => <div data-testid="mock-sms-card">SMS Verification Card</div>,
    BitcoinPaymentCard: () => <div data-testid="mock-bitcoin-card">Bitcoin Payment Card</div>,
  };
});

describe('HumanVerificationCards', () => {
  it('renders both verification cards', () => {
    render(<HumanPhoneVerification1 />);

    expect(screen.getByTestId('mock-sms-card')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bitcoin-card')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanPhoneVerification1 />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
