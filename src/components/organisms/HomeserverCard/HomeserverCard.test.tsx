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

// Mock all the components to avoid complex dependencies
vi.mock('@/molecules', () => ({
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
  PopoverInviteHomeserver: () => <div data-testid="popover-invite-homeserver">Popover</div>,
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
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
  Button: ({
    children,
    onClick,
    disabled,
    className,
    id,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    id?: string;
  }) => (
    <button data-testid="button" id={id} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  formatInviteCode: (code: string) => code,
  Logger: {
    info: vi.fn(),
  },
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' '),
  Server: () => <div data-testid="server-icon">Server</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  ArrowRight: () => <div data-testid="arrow-right-icon">ArrowRight</div>,
  Loader2: () => <div data-testid="loader-icon">Loader</div>,
}));

// Mock app routes
vi.mock('@/app', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app')>();
  return {
    ...actual,
    ONBOARDING_ROUTES: {
      PROFILE: '/onboarding/profile',
      BACKUP: '/onboarding/backup',
    },
  };
});

describe('HomeserverCard', () => {
  const mockPush = vi.fn();
  const mockSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    vi.mocked(Core.useOnboardingStore).mockReturnValue({
      pubky: 'mock-public-key',
      secretKey: 'mock-secret-key',
    });
    vi.mocked(Core.AuthController.signUp).mockImplementation(mockSignUp);
  });

  it('handles Enter key on invite code input when form is valid', async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');

    // Enter a valid invite code (14 characters)
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH-IJKL' } });

    // Press Enter key
    fireEvent.keyDown(inviteCodeInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        keypair: {
          pubky: 'mock-public-key',
          secretKey: 'mock-secret-key',
        },
        signupToken: 'ABCD-EFGH-IJKL',
      });
    });
  });

  it('does not trigger signup on Enter when invite code is invalid', async () => {
    render(<HomeserverCard />);

    const inviteCodeInput = screen.getByTestId('input-field');

    // Enter an invalid invite code (less than 14 characters)
    fireEvent.change(inviteCodeInput, { target: { value: 'ABCD-EFGH' } });

    // Press Enter key
    fireEvent.keyDown(inviteCodeInput, { key: 'Enter' });

    // Wait a bit to ensure no async operations occur
    await new Promise((resolve) => setTimeout(resolve, 100));

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
