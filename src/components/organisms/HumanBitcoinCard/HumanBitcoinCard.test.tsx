import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanBitcoinCard } from './HumanBitcoinCard';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/hooks/useSatUsdRate', () => ({
  useBtcRate: () => ({ satUsd: 0.0005 }),
}));

vi.mock('@/hooks/useLnVerificationPrice', () => ({
  useLnVerificationPrice: () => ({ amountSat: 1000 }),
}));

describe('BitcoinPaymentCard', () => {
  it('renders bitcoin payment details and action', () => {
    render(<HumanBitcoinCard />);

    expect(screen.getByText(/Bitcoin Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/₿ 1,000/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay Once/i })).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
