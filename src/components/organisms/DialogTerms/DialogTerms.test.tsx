import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogTerms } from './DialogTerms';

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
  SidebarButton: ({
    children,
    icon: Icon,
  }: {
    children: React.ReactNode;
    icon: React.ComponentType<{ className?: string }>;
  }) => (
    <button data-testid="sidebar-button">
      <Icon data-testid="sidebar-button-icon" />
      <span data-testid="sidebar-button-text">{children}</span>
    </button>
  ),
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a data-testid="link" href={href} className={className}>
      {children}
    </a>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({
    children,
    as: Tag = 'p',
    className,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
  }) => (
    <Tag data-testid="typography" className={className}>
      {children}
    </Tag>
  ),
  List: ({
    children,
    as: Tag = 'ul',
    className,
  }: {
    children: React.ReactNode;
    as?: React.ElementType;
    className?: string;
  }) => (
    <Tag data-testid="list" className={className}>
      {children}
    </Tag>
  ),
}));

describe('DialogTerms', () => {
  it('renders with default props', () => {
    render(<DialogTerms />);

    const dialog = screen.getByTestId('dialog');
    const trigger = screen.getByTestId('dialog-trigger');
    const content = screen.getByTestId('dialog-content');
    const header = screen.getByTestId('dialog-header');
    const title = screen.getByTestId('dialog-title');

    expect(dialog).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('renders terms of service content', () => {
    render(<DialogTerms />);

    // Check for some key terms content - use getAllByText for elements that appear multiple times
    expect(screen.getByText(/Thank you for using the Pubky platform/)).toBeInTheDocument();
    expect(screen.getAllByText(/TERMS AND CONDITIONS/)).toHaveLength(2); // Appears twice
    expect(screen.getByText(/Effective Date: January 29, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/PLEASE REVIEW THE ARBITRATION PROVISION/)).toBeInTheDocument();
  });
});

describe('DialogTerms - Snapshots', () => {
  it('matches snapshot for default DialogTerms', () => {
    const { container } = render(<DialogTerms />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
