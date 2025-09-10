import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogConfirmBackup } from './DialogConfirmBackup';

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
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
  Button: ({
    children,
    size,
    variant,
    className,
  }: {
    children: React.ReactNode;
    size?: string;
    variant?: string;
    className?: string;
  }) => (
    <button data-testid="button" data-size={size} data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

// Mock libs
vi.mock('@/libs', () => ({
  TriangleAlert: ({ className }: { className?: string }) => (
    <div data-testid="triangle-alert" className={className}>
      TriangleAlert
    </div>
  ),
  ShieldCheck: ({ className }: { className?: string }) => (
    <div data-testid="shield-check" className={className}>
      ShieldCheck
    </div>
  ),
  Check: ({ className }: { className?: string }) => (
    <div data-testid="check" className={className}>
      Check
    </div>
  ),
}));

describe('DialogConfirmBackup', () => {
  it('renders with correct structure', () => {
    render(<DialogConfirmBackup />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
  });

  it('renders trigger button with correct text', () => {
    render(<DialogConfirmBackup />);

    const triggerButton = screen.getByText('Done');
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton.tagName).toBe('BUTTON');
  });

  it('applies correct styling to trigger button', () => {
    render(<DialogConfirmBackup />);

    const triggerButton = screen.getByText('Done');
    expect(triggerButton).toHaveClass('bg-card');
  });

  it('renders dialog title correctly', () => {
    render(<DialogConfirmBackup />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('All backed up?');
    expect(title.tagName).toBe('H2');
  });

  it('renders description text', () => {
    render(<DialogConfirmBackup />);

    const description = screen.getByText(/Please confirm if you have completed/);
    expect(description).toBeInTheDocument();
  });

  it('renders warning alert with correct content', () => {
    render(<DialogConfirmBackup />);

    expect(screen.getByText('Back up now to avoid losing your account!')).toBeInTheDocument();
    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
  });

  it('applies correct styling to warning alert', () => {
    render(<DialogConfirmBackup />);

    const warningContainer = screen
      .getByText('Back up now to avoid losing your account!')
      .closest('[data-testid="container"]');
    expect(warningContainer).toHaveClass(
      'bg-destructive',
      'dark:bg-destructive\\60/60',
      'px-6',
      'py-3',
      'rounded-lg',
      'flex',
      'flex-row',
      'items-center',
      'gap-3',
    );
  });

  it('renders backup methods button with correct content', () => {
    render(<DialogConfirmBackup />);

    const backupButton = screen.getByText('Backup methods');
    expect(backupButton).toBeInTheDocument();
    expect(backupButton).toHaveAttribute('data-size', 'lg');
    expect(backupButton).toHaveAttribute('data-variant', 'outline');
  });

  it('renders confirm button with correct content', () => {
    render(<DialogConfirmBackup />);

    const confirmButton = screen.getByText('Confirm (delete seed)');
    expect(confirmButton).toBeInTheDocument();
    expect(confirmButton).toHaveAttribute('data-size', 'lg');
  });

  it('renders icons in buttons', () => {
    render(<DialogConfirmBackup />);

    expect(screen.getByTestId('shield-check')).toBeInTheDocument();
    expect(screen.getByTestId('check')).toBeInTheDocument();
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogConfirmBackup />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl', 'gap-0');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogConfirmBackup />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('applies correct styling to description text', () => {
    render(<DialogConfirmBackup />);

    const description = screen.getByText(/Please confirm if you have completed/);
    expect(description).toHaveClass('text-muted-foreground', 'font-medium');
  });

  it('applies correct styling to warning text', () => {
    render(<DialogConfirmBackup />);

    const warningText = screen.getByText('Back up now to avoid losing your account!');
    expect(warningText).toHaveClass('font-bold');
  });

  it('applies correct styling to warning icon', () => {
    render(<DialogConfirmBackup />);

    const warningIcon = screen.getByTestId('triangle-alert');
    expect(warningIcon).toHaveClass('h-4', 'w-4', 'font-bold');
  });

  it('applies correct styling to button icons', () => {
    render(<DialogConfirmBackup />);

    const shieldIcon = screen.getByTestId('shield-check');
    const checkIcon = screen.getByTestId('check');

    expect(shieldIcon).toHaveClass('h-4', 'w-4');
    expect(checkIcon).toHaveClass('h-4', 'w-4');
  });

  it('renders all required elements', () => {
    render(<DialogConfirmBackup />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Back up now to avoid losing your account!')).toBeInTheDocument();
    expect(screen.getByText('Backup methods')).toBeInTheDocument();
    expect(screen.getByText('Confirm (delete seed)')).toBeInTheDocument();
    expect(screen.getByTestId('triangle-alert')).toBeInTheDocument();
    expect(screen.getByTestId('shield-check')).toBeInTheDocument();
    expect(screen.getByTestId('check')).toBeInTheDocument();
  });
});
