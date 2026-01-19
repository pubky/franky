import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockUseSmsVerificationInfo = vi.fn();
vi.mock('@/hooks/useSmsVerificationInfo', () => ({
  useSmsVerificationInfo: () => mockUseSmsVerificationInfo(),
}));

import { HumanSmsCard } from './HumanSmsCard';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('SmsVerificationCard', () => {
  beforeEach(() => {
    mockUseSmsVerificationInfo.mockReturnValue({ available: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Fires event on button click', () => {
    let isOnboardingClicked = false;
    const { container } = render(
      <HumanSmsCard
        onClick={() => {
          isOnboardingClicked = true;
        }}
      />,
    );

    const button = container.querySelector('[data-testid="human-sms-card-receive-sms-btn"]');
    fireEvent.click(button!);

    expect(isOnboardingClicked).toBe(true);
  });

  it('renders geoblocking overlay when not available', () => {
    mockUseSmsVerificationInfo.mockReturnValue({ available: false });
    render(<HumanSmsCard />);

    // Check for geoblocking alert
    expect(screen.getByTestId('geoblock-alert')).toBeInTheDocument();
    expect(screen.getByText(/Currently not available in your country/i)).toBeInTheDocument();

    // Card should have blur class
    const card = screen.getByTestId('sms-verification-card');
    expect(card).toHaveClass('blur-[5px]');
    expect(card).toHaveClass('opacity-60');

    // Button should be disabled
    expect(screen.getByTestId('human-sms-card-receive-sms-btn')).toBeDisabled();
  });

  it('does not fire event when geoblocked', () => {
    mockUseSmsVerificationInfo.mockReturnValue({ available: false });
    let isOnboardingClicked = false;
    const { container } = render(
      <HumanSmsCard
        onClick={() => {
          isOnboardingClicked = true;
        }}
      />,
    );

    const button = container.querySelector('[data-testid="human-sms-card-receive-sms-btn"]');
    fireEvent.click(button!);

    // Button is disabled, so click should not fire
    expect(isOnboardingClicked).toBe(false);
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanSmsCard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when geoblocked', () => {
    mockUseSmsVerificationInfo.mockReturnValue({ available: false });
    const { container } = render(<HumanSmsCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
