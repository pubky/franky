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
  it('matches snapshot for default AlertBackup', () => {
    const { container } = render(<AlertBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders warning icon and message', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByText('Back up now')).toBeInTheDocument();
    expect(screen.getByText('to avoid losing your account!')).toBeInTheDocument();
  });

  it('renders dialog components', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('dialog-backup')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-confirm-backup')).toBeInTheDocument();
  });

  it('matches snapshot for warning message', () => {
    const { container } = render(<AlertBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for warning icon', () => {
    const { container } = render(<AlertBackup />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders all required elements', () => {
    render(<AlertBackup />);

    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByText('Back up now')).toBeInTheDocument();
    expect(screen.getByText('to avoid losing your account!')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-backup')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-confirm-backup')).toBeInTheDocument();
  });
});
