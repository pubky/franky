import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Radix UI Dialog components
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-root">{children}</div>,
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
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
    <button data-testid="dialog-close" className={className}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      X
    </div>
  ),
}));

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

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('renders dialog root correctly', () => {
      render(
        <Dialog>
          <div>Dialog content</div>
        </Dialog>,
      );

      const dialogRoot = screen.getByTestId('dialog-root');
      expect(dialogRoot).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });
  });

  describe('DialogTrigger', () => {
    it('renders dialog trigger correctly', () => {
      render(
        <DialogTrigger>
          <button>Open Dialog</button>
        </DialogTrigger>,
      );

      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('passes asChild prop correctly', () => {
      render(
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>,
      );

      const trigger = screen.getByTestId('dialog-trigger');
      expect(trigger).toHaveAttribute('data-as-child', 'true');
    });
  });

  describe('DialogContent', () => {
    it('renders dialog content with default styling', () => {
      render(
        <DialogContent>
          <div>Content</div>
        </DialogContent>,
      );

      const content = screen.getByTestId('dialog-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        'bg-background',
        'fixed',
        'z-50',
        'grid',
        'w-full',
        'gap-4',
        'border',
        'p-6',
        'shadow-lg',
        'duration-200',
      );
    });

    it('applies custom className', () => {
      render(
        <DialogContent className="custom-class">
          <div>Content</div>
        </DialogContent>,
      );

      const content = screen.getByTestId('dialog-content');
      expect(content).toHaveClass('custom-class');
    });

    it('renders close button by default', () => {
      render(
        <DialogContent>
          <div>Content</div>
        </DialogContent>,
      );

      const closeButton = screen.getByTestId('dialog-close');
      const xIcon = screen.getByTestId('x-icon');

      expect(closeButton).toBeInTheDocument();
      expect(xIcon).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument(); // sr-only text
    });

    it('renders close button when showCloseButton is true', () => {
      render(
        <DialogContent showCloseButton={true}>
          <div>Content</div>
        </DialogContent>,
      );

      const closeButton = screen.getByTestId('dialog-close');
      const xIcon = screen.getByTestId('x-icon');

      expect(closeButton).toBeInTheDocument();
      expect(xIcon).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <DialogContent showCloseButton={false}>
          <div>Content</div>
        </DialogContent>,
      );

      const closeButton = screen.queryByTestId('dialog-close');
      const xIcon = screen.queryByTestId('x-icon');

      expect(closeButton).not.toBeInTheDocument();
      expect(xIcon).not.toBeInTheDocument();
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });

    it('applies correct styling to close button', () => {
      render(
        <DialogContent>
          <div>Content</div>
        </DialogContent>,
      );

      const closeButton = screen.getByTestId('dialog-close');
      expect(closeButton).toHaveClass(
        'absolute',
        'right-4',
        'top-4',
        'w-8',
        'h-8',
        'bg-secondary',
        'text-secondary-foreground',
        'hover:bg-secondary/80',
        'rounded-full',
        'cursor-pointer',
      );
    });
  });

  describe('DialogHeader', () => {
    it('renders dialog header with correct styling', () => {
      render(
        <DialogHeader>
          <div>Header content</div>
        </DialogHeader>,
      );

      const header = document.querySelector('[data-slot="dialog-header"]');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'text-center', 'sm:text-left');
    });

    it('applies custom className', () => {
      render(
        <DialogHeader className="custom-header">
          <div>Header content</div>
        </DialogHeader>,
      );

      const header = document.querySelector('[data-slot="dialog-header"]');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('DialogFooter', () => {
    it('renders dialog footer with correct styling', () => {
      render(
        <DialogFooter>
          <div>Footer content</div>
        </DialogFooter>,
      );

      const footer = document.querySelector('[data-slot="dialog-footer"]');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row', 'sm:justify-end');
    });

    it('applies custom className', () => {
      render(
        <DialogFooter className="custom-footer">
          <div>Footer content</div>
        </DialogFooter>,
      );

      const footer = document.querySelector('[data-slot="dialog-footer"]');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('DialogTitle', () => {
    it('renders dialog title with correct styling', () => {
      render(<DialogTitle>Dialog Title</DialogTitle>);

      const title = screen.getByTestId('dialog-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Dialog Title');
      expect(title.tagName).toBe('H2');
      expect(title).toHaveClass('text-2xl', 'font-bold');
    });

    it('applies custom className', () => {
      render(<DialogTitle className="custom-title">Dialog Title</DialogTitle>);

      const title = screen.getByTestId('dialog-title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('DialogDescription', () => {
    it('renders dialog description with correct styling', () => {
      render(<DialogDescription>Dialog description</DialogDescription>);

      const description = screen.getByTestId('dialog-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Dialog description');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(<DialogDescription className="custom-description">Dialog description</DialogDescription>);

      const description = screen.getByTestId('dialog-description');
      expect(description).toHaveClass('custom-description');
    });
  });

  describe('Complete Dialog Structure', () => {
    it('renders complete dialog with all components', () => {
      render(
        <Dialog>
          <DialogTrigger>
            <button>Open</button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>Test description</DialogDescription>
            </DialogHeader>
            <div>Dialog body content</div>
            <DialogFooter>
              <button>Cancel</button>
              <button>OK</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="dialog-header"]')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="dialog-footer"]')).toBeInTheDocument();

      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Dialog body content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });
});
