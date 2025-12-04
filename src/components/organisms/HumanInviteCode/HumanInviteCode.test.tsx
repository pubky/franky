import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { HumanInviteCode } from './HumanInviteCode';

vi.mock('@/molecules', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/molecules');

  return {
    ...actual,
    // Use the real HumanHeader from molecules, other exports unchanged
  };
});

describe('HumanInviteCode', () => {
  it('renders invite code input card', () => {
    render(<HumanInviteCode onBack={() => {}} onSuccess={() => {}} />);

    expect(screen.getByTestId('human-invite-code-card')).toBeInTheDocument();
    expect(screen.getByTestId('human-invite-code-input')).toBeInTheDocument();
  });

  it('calls onSuccess with the entered invite code when clicking Continue', () => {
    const onSuccess = vi.fn();
    render(<HumanInviteCode onBack={() => {}} onSuccess={onSuccess} />);

    const input = screen.getByTestId('human-invite-code-input') as HTMLInputElement;
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Initially disabled
    expect(continueButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'MY-INVITE-CODE ' } });
    expect(continueButton).not.toBeDisabled();

    fireEvent.click(continueButton);
    expect(onSuccess).toHaveBeenCalledWith('MY-INVITE-CODE');
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanInviteCode onBack={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
