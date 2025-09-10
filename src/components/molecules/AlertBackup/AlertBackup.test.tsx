import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertBackup } from './AlertBackup';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  TriangleAlert: ({ className }: { className?: string }) => (
    <div data-testid="triangle-alert" className={className}>
      TriangleAlert
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  DialogBackup: () => <div data-testid="dialog-backup">DialogBackup</div>,
  DialogConfirmBackup: () => <div data-testid="dialog-confirm-backup">DialogConfirmBackup</div>,
}));

describe('AlertBackup', () => {
  it('renders with correct structure', () => {
    render(<AlertBackup />);

    const mainContainer = screen.getAllByTestId('container')[0];
    expect(mainContainer).toHaveClass(
      'px-6',
      'py-3',
      'bg-brand',
      'rounded-lg',
      'flex',
      'flex-row',
      'items-center',
      'gap-3',
    );
  });

  it('renders warning icon and message', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByText('Back up now to avoid losing your account!')).toBeInTheDocument();
  });

  it('renders dialog components', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('dialog-backup')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-confirm-backup')).toBeInTheDocument();
  });

  it('applies correct styling to warning message', () => {
    render(<AlertBackup />);

    const warningText = screen.getByText('Back up now to avoid losing your account!');
    expect(warningText).toHaveClass('font-bold', 'text-primary-foreground');
  });

  it('applies correct styling to warning icon', () => {
    render(<AlertBackup />);

    const warningIcon = screen.getByTestId('triangle-alert');
    expect(warningIcon).toHaveClass('h-4', 'w-4', 'font-bold', 'text-primary-foreground');
  });

  it('renders all required elements', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByText('Back up now to avoid losing your account!')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-backup')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-confirm-backup')).toBeInTheDocument();
  });
});
