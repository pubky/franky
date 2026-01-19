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
const mockUseLnVerificationInfo = vi.fn();

vi.mock('@/hooks/useSatUsdRate', () => ({
  useBtcRate: () => mockUseBtcRate(),
}));

vi.mock('@/hooks/useLnVerificationInfo', () => ({
  useLnVerificationInfo: () => mockUseLnVerificationInfo(),
}));

describe('BitcoinPaymentCard', () => {
  beforeEach(() => {
    mockUseBtcRate.mockReturnValue({ satUsd: 0.0005 });
    mockUseLnVerificationInfo.mockReturnValue({ available: true, amountSat: 1000 });
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

  it('renders full skeleton card when availability is loading', () => {
    mockUseLnVerificationInfo.mockReturnValue(null);
    render(<HumanBitcoinCard />);

    // Should show skeleton card, not the actual card
    expect(screen.getByTestId('bitcoin-payment-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('bitcoin-payment-card')).not.toBeInTheDocument();
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

  it('renders geoblocking overlay when not available', () => {
    mockUseLnVerificationInfo.mockReturnValue({ available: false });
    render(<HumanBitcoinCard />);

    // Check for geoblocking alert
    expect(screen.getByTestId('geoblock-alert')).toBeInTheDocument();
    expect(screen.getByText(/Currently not available in your country/i)).toBeInTheDocument();

    // Card should have blur class
    const card = screen.getByTestId('bitcoin-payment-card');
    expect(card).toHaveClass('blur-[5px]');
    expect(card).toHaveClass('opacity-60');

    // Button should be disabled
    expect(screen.getByRole('button', { name: /Pay Once/i })).toBeDisabled();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    mockUseLnVerificationInfo.mockReturnValue(null);
    mockUseBtcRate.mockReturnValue(null);
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when geoblocked', () => {
    mockUseLnVerificationInfo.mockReturnValue({ available: false });
    const { container } = render(<HumanBitcoinCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
