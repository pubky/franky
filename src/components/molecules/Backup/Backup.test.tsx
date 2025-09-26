import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackupNavigation, BackupPageHeader } from './Backup';
import * as App from '@/app';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Note: BackupMethodCard has been moved to organisms and no longer needs store mocking here

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
    level: number;
    size?: string;
    className?: string;
  }) => (
    <div data-testid={`heading-${level}`} data-size={size} className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="typography" data-size={size} className={className}>
      {children}
    </div>
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
    backText,
    continueText,
  }: {
    className?: string;
    onHandleBackButton?: () => void;
    onHandleContinueButton?: () => void;
    backText?: string;
    continueText?: string;
  }) => (
    <div data-testid="buttons-navigation" className={className}>
      <button data-testid="back-button" onClick={onHandleBackButton}>
        {backText}
      </button>
      <button data-testid="continue-button" onClick={onHandleContinueButton}>
        {continueText}
      </button>
    </div>
  ),
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="page-title" data-size={size}>
      {children}
    </div>
  ),
}));

// BackupMethodCard tests have been moved to organisms/BackupMethodCard/BackupMethodCard.test.tsx

describe('BackupNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation buttons', () => {
    render(<BackupNavigation />);

    expect(screen.getByTestId('buttons-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('back-button')).toHaveTextContent('Back');
    expect(screen.getByTestId('continue-button')).toHaveTextContent('Continue');
  });

  it('handles back button click', () => {
    render(<BackupNavigation />);

    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.PUBKY);
  });

  it('handles continue button click', () => {
    render(<BackupNavigation />);

    const continueButton = screen.getByTestId('continue-button');
    fireEvent.click(continueButton);

    expect(mockPush).toHaveBeenCalledWith(App.ONBOARDING_ROUTES.HOMESERVER);
  });

  it('applies correct styling', () => {
    render(<BackupNavigation />);

    const navigation = screen.getByTestId('buttons-navigation');
    expect(navigation).toHaveClass('py-6');
  });
});

describe('BackupPageHeader', () => {
  it('renders page header with title and subtitle', () => {
    render(<BackupPageHeader />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
  });

  it('renders correct title text', () => {
    render(<BackupPageHeader />);

    const pageTitle = screen.getByTestId('page-title');
    expect(pageTitle).toHaveTextContent('Back up your pubky.');
    expect(pageTitle).toHaveAttribute('data-size', 'large');
  });

  it('renders correct subtitle text', () => {
    render(<BackupPageHeader />);

    const pageSubtitle = screen.getByTestId('page-subtitle');
    expect(pageSubtitle).toHaveTextContent('You need a backup to restore access to your account later.');
  });

  it('includes branded text in title', () => {
    render(<BackupPageHeader />);

    const pageTitle = screen.getByTestId('page-title');
    expect(pageTitle.innerHTML).toContain('text-brand');
  });
});
