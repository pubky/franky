import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogTerms } from './DialogTerms';

// Mock UI components
vi.mock('@/components/ui', () => ({
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

  it('displays default link text', () => {
    render(<DialogTerms />);

    const links = screen.getAllByText('Terms of Service');
    const triggerLink = links.find((link) => link.tagName === 'A');
    expect(triggerLink).toBeInTheDocument();
    expect(triggerLink?.tagName).toBe('A');
  });

  it('displays custom link text', () => {
    render(<DialogTerms linkText="Custom Terms Link" />);

    const link = screen.getByText('Custom Terms Link');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('applies correct styling to trigger link', () => {
    render(<DialogTerms />);

    const links = screen.getAllByText('Terms of Service');
    const triggerLink = links.find((link) => link.tagName === 'A');
    expect(triggerLink).toHaveClass('cursor-pointer', 'text-brand');
  });

  it('renders dialog title correctly', () => {
    render(<DialogTerms />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Terms of Service');
    expect(title.tagName).toBe('H2');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogTerms />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogTerms />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('renders effective date', () => {
    render(<DialogTerms />);

    expect(screen.getByText(/Effective Date: 15 May 2025/)).toBeInTheDocument();
  });

  it('renders scrollable content area', () => {
    render(<DialogTerms />);

    const scrollableArea = document.querySelector('.h-\\[320px\\]');
    expect(scrollableArea).toBeInTheDocument();
    expect(scrollableArea).toHaveClass('h-[320px]', 'pr-4', 'overflow-y-auto');
  });

  it('renders terms of service content', () => {
    render(<DialogTerms />);

    // Check for some key terms content
    expect(screen.getByText(/Thank you for using the Pubky platform/)).toBeInTheDocument();
    expect(screen.getByText(/TERMS AND CONDITIONS/)).toBeInTheDocument();
    expect(screen.getByText(/PLEASE REVIEW THE ARBITRATION PROVISION/)).toBeInTheDocument();
  });

  it('trigger uses asChild prop correctly', () => {
    render(<DialogTerms />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('maintains proper content structure', () => {
    render(<DialogTerms />);

    const contentDiv = document.querySelector('.flex.flex-col.gap-4');
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toHaveClass('flex', 'flex-col', 'gap-4');
  });

  it('handles different link text props', () => {
    const { rerender } = render(<DialogTerms linkText="Terms" />);
    expect(screen.getByText('Terms')).toBeInTheDocument();

    rerender(<DialogTerms linkText="Service Terms" />);
    expect(screen.getByText('Service Terms')).toBeInTheDocument();
    expect(screen.queryByText('Terms')).not.toBeInTheDocument();
  });

  it('renders complete terms sections', () => {
    render(<DialogTerms />);

    // Check for main sections that should be present
    expect(screen.getByText(/TERMS AND CONDITIONS/)).toBeInTheDocument();
    expect(screen.getByText(/Effective Date: 15 May 2025/)).toBeInTheDocument();
    expect(screen.getByText(/Thank you for using the Pubky platform/)).toBeInTheDocument();
  });
});
