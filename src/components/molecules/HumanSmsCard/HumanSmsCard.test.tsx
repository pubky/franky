import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { HumanSmsCard } from './HumanSmsCard';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('SmsVerificationCard', () => {
  it('renders SMS verification copy and action', () => {
    render(<HumanSmsCard />);

    expect(screen.getByText(/SMS Verification/i)).toBeInTheDocument();
    expect(screen.getByText(/Free/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Receive SMS/i })).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanSmsCard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
