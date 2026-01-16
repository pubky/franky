import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanBitcoinCard } from './HumanBitcoinCard';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockUseBtcRate = vi.fn();
const mockUseLnVerificationPrice = vi.fn();

vi.mock('@/hooks/useSatUsdRate', () => ({
  useBtcRate: () => mockUseBtcRate(),
}));

vi.mock('@/hooks/useLnVerificationPrice', () => ({
  useLnVerificationPrice: () => mockUseLnVerificationPrice(),
}));

describe('BitcoinPaymentCard', () => {
  beforeEach(() => {
    mockUseBtcRate.mockReturnValue({ satUsd: 0.0005 });
    mockUseLnVerificationPrice.mockReturnValue({ amountSat: 1000 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders bitcoin payment details and action', () => {
    render(<HumanBitcoinCard />);

    expect(screen.getByText(/Bitcoin Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/₿ 1,000/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay Once/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay Once/i })).not.toBeDisabled();
  });

  it('renders skeleton when price is loading', () => {
    mockUseLnVerificationPrice.mockReturnValue(null);
    const { container } = render(<HumanBitcoinCard />);

    // Check for skeleton elements (they have animate-pulse class)
    const skeletonContainer = container.querySelector('.animate-pulse');
    expect(skeletonContainer).toBeInTheDocument();

    // Button should be disabled when data is not available
    expect(screen.getByRole('button', { name: /Pay Once/i })).toBeDisabled();
  });

  it('renders skeleton when rate is loading', () => {
    mockUseBtcRate.mockReturnValue(null);
    const { container } = render(<HumanBitcoinCard />);

    // Check for skeleton elements
    const skeletonContainer = container.querySelector('.animate-pulse');
    expect(skeletonContainer).toBeInTheDocument();

    // Button should be disabled when data is not available
    expect(screen.getByRole('button', { name: /Pay Once/i })).toBeDisabled();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    mockUseLnVerificationPrice.mockReturnValue(null);
    mockUseBtcRate.mockReturnValue(null);
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
