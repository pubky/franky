import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepostHeader } from './RepostHeader';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="typography" className={className}>
      {children}
    </span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    className,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
  }) => (
    <button data-testid="button" onClick={onClick} disabled={disabled} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Repeat: ({ className }: { className?: string }) => <svg data-testid="repeat-icon" className={className} />,
  };
});

describe('RepostHeader', () => {
  it('renders text and icon', () => {
    render(<RepostHeader isCurrentUserRepost={false} />);

    expect(screen.getByTestId('repost-header')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    expect(screen.getByText('You reposted')).toBeInTheDocument();
  });

  it('shows undo button when current user reposted', () => {
    render(<RepostHeader isCurrentUserRepost={true} />);

    expect(screen.getByRole('button', { name: 'Undo repost' })).toBeInTheDocument();
  });

  it('calls onUndo when undo button clicked', () => {
    const onUndo = vi.fn();
    render(<RepostHeader isCurrentUserRepost={true} onUndo={onUndo} />);

    fireEvent.click(screen.getByRole('button', { name: 'Undo repost' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('disables undo button when undoing', () => {
    render(<RepostHeader isCurrentUserRepost={true} isUndoing={true} />);

    const button = screen.getByRole('button', { name: 'Undoing repost...' });
    expect(button).toBeDisabled();
  });
});
