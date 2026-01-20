import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { HumanInviteCode } from './HumanInviteCode';

describe('HumanInviteCode', () => {
  const mockOnBack = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('disables continue button when invite code is not complete', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when invite code is complete (14 characters)', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX-XXXX-XXXX' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).not.toBeDisabled();
  });

  it('shows loading state and disables button after clicking continue', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX-XXXX-XXXX' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).not.toBeDisabled();

    fireEvent.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(mockOnSuccess).toHaveBeenCalledWith('XXXX-XXXX-XXXX');
  });

  it('calls onBack when back button is clicked', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('converts input to uppercase', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abcd-efgh-ijkl' } });

    expect(input.value).toBe('ABCD-EFGH-IJKL');
  });

  it('submits on Enter key when invite code is complete', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX-XXXX-XXXX' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSuccess).toHaveBeenCalledWith('XXXX-XXXX-XXXX');
  });

  it('does not submit on Enter key when invite code is incomplete', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('prevents multiple submissions when loading', () => {
    render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX-XXXX-XXXX' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });

    // First click
    fireEvent.click(continueButton);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);

    // Second click should not trigger onSuccess again because button is disabled
    fireEvent.click(continueButton);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('matches snapshot when loading', () => {
    const { container } = render(<HumanInviteCode onBack={mockOnBack} onSuccess={mockOnSuccess} />);

    const input = screen.getByTestId('human-invite-code-input');
    fireEvent.change(input, { target: { value: 'XXXX-XXXX-XXXX' } });

    const continueButton = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueButton);

    expect(container.firstChild).toMatchSnapshot();
  });
});
