import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { HumanSmsCard } from './HumanSmsCard';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('SmsVerificationCard', () => {
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

  it('matches snapshot', () => {
    const { container } = render(<HumanSmsCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
