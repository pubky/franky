import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogPrivacy } from './DialogPrivacy';

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
  List: ({ children, as, className }: { children: React.ReactNode; as?: string; className?: string }) => {
    const Tag = as || 'ul';
    return (
      <Tag data-testid="list" className={className}>
        {children}
      </Tag>
    );
  },
}));

describe('DialogPrivacy', () => {
  it('renders with default props', () => {
    render(<DialogPrivacy />);

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

  it('displays default trigger text', () => {
    render(<DialogPrivacy />);

    const triggers = screen.getAllByText('Privacy Policy');
    const trigger = triggers.find((element) => element.tagName === 'SPAN');
    expect(trigger).toBeInTheDocument();
    expect(trigger?.tagName).toBe('SPAN');
  });

  it('displays static trigger text', () => {
    render(<DialogPrivacy />);

    const triggers = screen.getAllByText('Privacy Policy');
    const trigger = triggers.find((element) => element.tagName === 'SPAN');
    expect(trigger).toBeInTheDocument();
    expect(trigger?.tagName).toBe('SPAN');
    expect(trigger).toHaveTextContent('Privacy Policy');
  });

  it('applies correct styling to trigger', () => {
    render(<DialogPrivacy />);

    const triggers = screen.getAllByText('Privacy Policy');
    const trigger = triggers.find((element) => element.tagName === 'SPAN');
    expect(trigger).toHaveClass('text-brand');
  });

  it('renders dialog title correctly', () => {
    render(<DialogPrivacy />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Privacy Policy');
    expect(title.tagName).toBe('H2');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogPrivacy />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogPrivacy />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('renders effective date', () => {
    render(<DialogPrivacy />);

    const effectiveDate = screen.getByText('Effective Date: June 19, 2025');
    expect(effectiveDate).toBeInTheDocument();
    expect(effectiveDate).toHaveClass('text-muted-foreground');
  });

  it('renders scrollable content area', () => {
    render(<DialogPrivacy />);

    const scrollableArea = document.querySelector('.h-\\[320px\\]');
    expect(scrollableArea).toBeInTheDocument();
    expect(scrollableArea).toHaveClass('h-[320px]', 'pr-4', 'overflow-y-auto');
  });

  it('renders privacy policy content', () => {
    render(<DialogPrivacy />);

    // Check for some key privacy policy content
    expect(screen.getByText(/SCOPE This Privacy Policy/)).toBeInTheDocument();
    expect(screen.getByText(/POLICY SUMMARY This summary offers/)).toBeInTheDocument();
    expect(screen.getAllByText(/Synonym Software Ltd/).length).toBeGreaterThan(0);
  });

  it('trigger uses asChild prop correctly', () => {
    render(<DialogPrivacy />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('maintains proper content structure', () => {
    render(<DialogPrivacy />);

    const triggers = screen.getAllByText('Privacy Policy');
    const trigger = triggers.find((element) => element.tagName === 'SPAN');
    fireEvent.click(trigger!);

    // Check that dialog content is rendered
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Privacy Policy');
  });

  it('always displays the same static trigger text', () => {
    render(<DialogPrivacy />);
    const triggers = screen.getAllByText('Privacy Policy');
    const trigger = triggers.find((element) => element.tagName === 'SPAN');
    expect(trigger).toHaveTextContent('Privacy Policy');
  });

  it('renders complete privacy policy sections', () => {
    render(<DialogPrivacy />);

    // Check for main sections that should be present
    expect(screen.getByText(/SCOPE/)).toBeInTheDocument();
    expect(screen.getByText(/POLICY SUMMARY/)).toBeInTheDocument();
    expect(screen.getByText(/Effective Date: June 19, 2025/)).toBeInTheDocument();
  });
});
