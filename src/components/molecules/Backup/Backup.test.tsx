import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BackupNavigation, BackupPageHeader } from './Backup';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
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
      <button onClick={onHandleBackButton}>{backText}</button>
      <button onClick={onHandleContinueButton}>{continueText}</button>
    </div>
  ),
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <h1 data-testid="page-title" data-size={size}>
      {children}
    </h1>
  ),
}));

// Mock app
vi.mock('@/app', () => ({
  ONBOARDING_ROUTES: {
    HOMESERVER: '/homeserver',
    PUBKY: '/pubky',
  },
}));

describe('BackupNavigation - Snapshots', () => {
  it('matches snapshot for default BackupNavigation', () => {
    const { container } = render(<BackupNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('BackupPageHeader - Snapshots', () => {
  it('matches snapshot for default BackupPageHeader', () => {
    const { container } = render(<BackupPageHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
