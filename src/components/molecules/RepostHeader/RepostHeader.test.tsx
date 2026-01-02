import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RepostHeader } from './RepostHeader';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
    ['data-testid']: dataTestId,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId ?? 'container'} className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    className,
    ['data-testid']: dataTestId,
  }: {
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
  }) => (
    <span data-testid={dataTestId ?? 'typography'} className={className}>
      {children}
    </span>
  ),
  Button: ({
    children,
    onClick,
    disabled,
    className,
    'aria-label': ariaLabel,
    ['data-testid']: dataTestId,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
    'data-testid'?: string;
  }) => (
    <button
      data-testid={dataTestId ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/libs', async () => {
  const actual = await vi.importActual('@/libs');
  return {
    ...actual,
    Repeat: ({ className }: { className?: string }) => <svg data-testid="repeat-icon" className={className} />,
  };
});

describe('RepostHeader', () => {
  it('renders text and icon', () => {
    render(<RepostHeader onUndo={vi.fn()} />);

    expect(screen.getByTestId('repost-header')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-icon')).toBeInTheDocument();
    expect(screen.getByText('You reposted')).toBeInTheDocument();
  });

  it('shows undo button', () => {
    render(<RepostHeader onUndo={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Undo repost' })).toBeInTheDocument();
  });

  it('calls onUndo when undo button clicked', () => {
    const onUndo = vi.fn();
    render(<RepostHeader onUndo={onUndo} />);

    fireEvent.click(screen.getByRole('button', { name: 'Undo repost' }));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('disables undo button when undoing', () => {
    render(<RepostHeader onUndo={vi.fn()} isUndoing={true} />);

    const button = screen.getByRole('button', { name: 'Undoing repost...' });
    expect(button).toBeDisabled();
  });
});
