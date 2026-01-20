import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BackupNavigation, BackupPageHeader } from './Backup';
import * as Libs from '@/libs';

// Hoisted mocks so they can be used inside vi.mock factories
const { mockToast, mockSignUp } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockSignUp: vi.fn(),
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock core
vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    secretKey: 'test-secret-key',
    inviteCode: 'test-invite-code',
  }),
  AuthController: {
    signUp: mockSignUp,
  },
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    className,
    onClick,
    disabled,
    variant,
    size,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button
      data-testid="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  ButtonsNavigation: ({
    className,
    onHandleBackButton,
    onHandleContinueButton,
    loadingContinueButton,
    backText,
    continueText,
  }: {
    className?: string;
    onHandleBackButton?: () => void;
    onHandleContinueButton?: () => void;
    loadingContinueButton?: boolean;
    backText?: string;
    continueText?: string;
  }) => (
    <div data-testid="buttons-navigation" className={className}>
      <button data-testid="back-button" onClick={onHandleBackButton}>
        {backText}
      </button>
      <button
        data-testid="continue-button"
        onClick={onHandleContinueButton}
        disabled={loadingContinueButton}
        data-loading={loadingContinueButton}
      >
        {continueText}
      </button>
    </div>
  ),
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <h1 data-testid="page-title" data-size={size}>
      {children}
    </h1>
  ),
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock app
vi.mock('@/app', () => ({
  ONBOARDING_ROUTES: {
    HOMESERVER: '/homeserver',
    PUBKY: '/pubky',
    PROFILE: '/profile',
  },
}));

describe('BackupNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot for default BackupNavigation', () => {
    const { container } = render(<BackupNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('shows loading state when continue button is clicked', async () => {
    mockSignUp.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    expect(continueButton).toHaveAttribute('data-loading', 'false');

    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(continueButton).toHaveAttribute('data-loading', 'true');
    });
  });

  it('navigates to profile on successful signup', async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('shows error toast with correct message for 401 error', async () => {
    const error = new Libs.AppError('SESSION_EXPIRED', 'Session expired', 401);
    mockSignUp.mockRejectedValue(error);

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error - Failed to sign up',
        description: 'Invalid or expired invite code. Please get or request a new invite code.',
      });
    });
  });

  it('shows error message from AppError for non-401 errors', async () => {
    const error = new Libs.AppError('SIGNUP_FAILED', 'Custom error message', 500);
    mockSignUp.mockRejectedValue(error);

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error - Failed to sign up',
        description: 'Custom error message',
      });
    });
  });

  it('shows generic error message for non-AppError errors', async () => {
    mockSignUp.mockRejectedValue(new Error('Unknown error'));

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error - Failed to sign up',
        description: 'Something went wrong. Please try again.',
      });
    });
  });

  it('resets loading state after error', async () => {
    mockSignUp.mockRejectedValue(new Error('Error'));

    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(continueButton).toHaveAttribute('data-loading', 'false');
    });
  });
});

describe('BackupPageHeader - Snapshots', () => {
  it('matches snapshot for default BackupPageHeader', () => {
    const { container } = render(<BackupPageHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
