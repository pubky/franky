import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignInNavigation } from './SignInNavigation';
import * as App from '@/app';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Minimal atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" data-class-name={className}>
      {children}
    </div>
  ),
}));

// Use real libs - use actual implementations
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

// Stub child dialogs so we can trigger onRestore
vi.mock('@/organisms', () => ({
  DialogRestoreRecoveryPhrase: ({ onRestore }: { onRestore?: () => void }) => (
    <button data-testid="restore-phrase" onClick={onRestore}>
      Restore Phrase
    </button>
  ),
  DialogRestoreEncryptedFile: ({ onRestore }: { onRestore?: () => void }) => (
    <button data-testid="restore-file" onClick={onRestore}>
      Restore File
    </button>
  ),
}));

describe('SignInNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both restore dialogs', () => {
    render(<SignInNavigation />);

    expect(screen.getByTestId('restore-phrase')).toBeInTheDocument();
    expect(screen.getByTestId('restore-file')).toBeInTheDocument();
  });

  it('pushes to HOME on restore (phrase)', () => {
    render(<SignInNavigation />);

    fireEvent.click(screen.getByTestId('restore-phrase'));
    expect(mockPush).toHaveBeenCalledWith(App.HOME_ROUTES.HOME);
  });

  it('pushes to HOME on restore (file)', () => {
    render(<SignInNavigation />);

    fireEvent.click(screen.getByTestId('restore-file'));
    expect(mockPush).toHaveBeenCalledWith(App.HOME_ROUTES.HOME);
  });
});

describe('SignInNavigation - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<SignInNavigation />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
