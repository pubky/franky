import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { HomeserverCard } from './HomeserverCard';
import * as Core from '@/core';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the onboarding store
vi.mock('@/core', () => ({
  useOnboardingStore: vi.fn(),
  AuthController: {
    signUp: vi.fn(),
  },
}));

// Mock molecules using importActual
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    ContentCard: ({ children }: { children: React.ReactNode }) => <div data-testid="content-card">{children}</div>,
    InputField: ({
      id,
      value,
      onChange,
      onKeyDown,
      placeholder,
      disabled,
    }: {
      id?: string;
      value: string;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      placeholder?: string;
      disabled?: boolean;
    }) => (
      <input
        data-testid="input-field"
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
    ),
    HomeserverFooter: () => <div data-testid="homeserver-footer">Footer</div>,
    HomeserverNavigation: ({
      continueButtonDisabled,
      onHandleContinueButton,
      continueText,
    }: {
      continueButtonDisabled?: boolean;
      onHandleContinueButton?: () => void;
      continueText?: string;
    }) => (
      <div data-testid="homeserver-navigation">
        <button data-testid="continue-button" disabled={continueButtonDisabled} onClick={onHandleContinueButton}>
          {continueText || 'Continue'}
        </button>
      </div>
    ),
    PopoverInviteHomeserver: () => <div data-testid="popover-invite-homeserver">Popover</div>,
    useToast: () => ({
      toast: vi.fn(),
    }),
  };
});

// Mock atoms using importActual
vi.mock('@/atoms', async () => {
  const actual = await vi.importActual('@/atoms');
  return {
    ...actual,
    Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="container" className={className}>
        {children}
      </div>
    ),
    Heading: ({
      children,
      level,
      size,
      className,
    }: {
      children: React.ReactNode;
      level?: number;
      size?: string;
      className?: string;
    }) => (
      <h3 data-testid="heading" data-level={level} data-size={size} className={className}>
        {children}
      </h3>
    ),
    Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
      <p data-testid="typography" data-size={size} className={className}>
        {children}
      </p>
    ),
  };
});

describe('HomeserverCard', () => {
  const mockPush = vi.fn();
  const mockSignUp = vi.fn();
  const mockSetInviteCode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup router mock
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });

    // Setup onboarding store mock
    (Core.useOnboardingStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      inviteCode: '',
      setInviteCode: mockSetInviteCode,
    });

    // Setup AuthController mock
    Core.AuthController.signUp = mockSignUp;
    mockSignUp.mockResolvedValue(undefined);
  });

  it('renders the homeserver card with all components', () => {
    render(<HomeserverCard />);

    expect(screen.getByTestId('content-card')).toBeInTheDocument();
    expect(screen.getByTestId('homeserver-footer')).toBeInTheDocument();
    expect(screen.getByTestId('homeserver-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('input-field')).toBeInTheDocument();
  });

  it('validates invite code format correctly', () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');
    const continueButton = screen.getByTestId('continue-button');

    // Initially disabled (empty invite code)
    expect(continueButton).toBeDisabled();

    // Invalid format
    fireEvent.change(inviteCodeInput, { target: { value: 'INVALID' } });
    expect(continueButton).toBeDisabled();

    // Valid format
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH-IJKL' } });
    expect(continueButton).not.toBeDisabled();
  });

  it('handles successful signup', async () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');
    const continueButton = screen.getByText('Continue');

    // Enter a valid invite code
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH-IJKL' } });

    // Click continue
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        signupToken: 'ABCD-EFGH-IJKL',
        keypair: { pubky: undefined, secretKey: undefined },
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/onboarding/profile');
    });
  });

  it('handles Enter key on invite code input when form is valid', async () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');

    // Enter a valid invite code
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH-IJKL' } });

    // Press Enter
    fireEvent.keyDown(inviteCodeInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        signupToken: 'ABCD-EFGH-IJKL',
        keypair: { pubky: undefined, secretKey: undefined },
      });
    });
  });

  it('does not trigger signup on Enter when invite code is invalid', async () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');

    // Enter an invalid invite code
    fireEvent.change(inviteCodeInput, { target: { value: 'INVALID' } });

    // Press Enter
    fireEvent.keyDown(inviteCodeInput, { key: 'Enter' });

    // Should not call signUp
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('does not trigger signup on Enter when loading', async () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');
    const continueButton = screen.getByText('Continue');

    // Enter a valid invite code
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH-IJKL' } });

    // Start the signup process by clicking continue
    fireEvent.click(continueButton);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText('Validating')).toBeInTheDocument();
    });

    // Try to press Enter while loading
    fireEvent.keyDown(inviteCodeInput, { key: 'Enter' });

    // The signup should only be called once (from the button click)
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });
});
