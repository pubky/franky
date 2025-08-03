import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogAge } from './DialogAge';

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
  Typography: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'p';
    return (
      <Tag data-testid="typography" className={className}>
        {children}
      </Tag>
    );
  },
}));

describe('DialogAge', () => {
  it('renders with default props', () => {
    render(<DialogAge />);

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

  it('displays default link text', () => {
    render(<DialogAge />);

    const link = screen.getByText('Privacy Policy');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('displays custom link text', () => {
    render(<DialogAge linkText="18+" />);

    const link = screen.getByText('18+');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('applies correct styling to trigger link', () => {
    render(<DialogAge />);

    const link = screen.getByText('Privacy Policy');
    expect(link).toHaveClass('text-brand');
  });

  it('renders dialog title correctly', () => {
    render(<DialogAge />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Age minimum: 18');
    expect(title.tagName).toBe('H2');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogAge />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogAge />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('renders age requirement content', () => {
    render(<DialogAge />);

    expect(screen.getByText(/You can only use Pubky if you are over 18 years old/)).toBeInTheDocument();
  });

  it('trigger uses asChild prop correctly', () => {
    render(<DialogAge />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('maintains proper content structure', () => {
    render(<DialogAge />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    // Check that dialog content is rendered
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Age minimum: 18');
    expect(screen.getByText('You can only use Pubky if you are over 18 years old.')).toBeInTheDocument();
  });

  it('handles different link text props', () => {
    const { rerender } = render(<DialogAge linkText="16+" />);
    expect(screen.getByText('16+')).toBeInTheDocument();

    rerender(<DialogAge linkText="21+" />);
    expect(screen.getByText('21+')).toBeInTheDocument();
    expect(screen.queryByText('16+')).not.toBeInTheDocument();
  });

  it('renders age-related content sections', () => {
    render(<DialogAge />);

    // Check for content related to age requirements
    expect(screen.getByText(/over 18 years old/)).toBeInTheDocument();
  });
});
