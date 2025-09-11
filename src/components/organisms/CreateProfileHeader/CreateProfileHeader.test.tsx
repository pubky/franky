import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CreateProfileHeader } from './CreateProfileHeader';

// Mock core store
vi.mock('@/core', () => ({
  useOnboardingStore: () => ({
    publicKey: 'mock-public-key-1234567890',
  }),
}));

// Mock libs
vi.mock('@/libs', () => ({
  formatPublicKey: vi.fn(({ key, length }: { key: string; length: number }) => `${key.substring(0, length)}...`),
  useCopyToClipboard: () => ({
    copyToClipboard: vi.fn(),
  }),
  Key: ({ className }: { className?: string }) => (
    <div data-testid="key-icon" className={className}>
      Key
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PageTitle: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="page-title" data-size={size}>
      {children}
    </div>
  ),
  PopoverPublicKey: ({ className }: { className?: string }) => (
    <div data-testid="popover-public-key" className={className}>
      Popover
    </div>
  ),
  toast: vi.fn(() => ({
    dismiss: vi.fn(),
  })),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
  Button: ({
    children,
    variant,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    onClick?: () => void;
  }) => (
    <button data-testid={`button-${variant || 'default'}`} className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('CreateProfileHeader - Snapshots', () => {
  it('matches snapshot for default CreateProfileHeader', () => {
    const { container } = render(<CreateProfileHeader />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
