import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-root">{children}</div>,
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild ? 'true' : 'false'}>
      {children}
    </div>
  ),
  Content: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  Header: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  Footer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-footer" className={className}>
      {children}
    </div>
  ),
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  Description: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="dialog-description" className={className}>
      {children}
    </p>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ className }: { className?: string }) => <div data-testid="dialog-overlay" className={className} />,
  Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button id="dialog-close-btn" data-testid="dialog-close" className={className}>
      {children}
    </button>
  ),
}));

// Mock @/libs - use actual implementations and only stub cn helper
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' '),
  };
});

// Import the actual Dialog components after mocking
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog';

describe('Dialog', () => {
  it('renders with default props', () => {
    render(<Dialog>Default Dialog</Dialog>);
    const dialog = screen.getByText('Default Dialog');
    expect(dialog).toBeInTheDocument();
  });
});

describe('Dialog - Snapshots', () => {
  it('matches snapshot for Dialog with default props', () => {
    const { container } = render(
      <Dialog>
        <div>Dialog Content</div>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogTrigger with default props', () => {
    const { container } = render(
      <DialogTrigger>
        <button>Open Dialog</button>
      </DialogTrigger>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogTrigger with asChild', () => {
    const { container } = render(
      <DialogTrigger asChild>
        <button>Open Dialog</button>
      </DialogTrigger>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matched snapshot for DialogContent with default props', () => {
    const { container } = render(
      <DialogContent>
        <div>Dialog Content</div>
      </DialogContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent with close button', () => {
    const { container } = render(
      <DialogContent showCloseButton={true}>
        <div>Dialog Content</div>
      </DialogContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent without close button', () => {
    const { container } = render(
      <DialogContent showCloseButton={false}>
        <div>Dialog Content</div>
      </DialogContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogHeader', () => {
    const { container } = render(
      <DialogHeader>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>Dialog Description</DialogDescription>
      </DialogHeader>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogFooter', () => {
    const { container } = render(
      <DialogFooter>
        <button>Cancel</button>
        <button>OK</button>
      </DialogFooter>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for complete dialog structure', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>
          <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
