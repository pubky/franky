import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock Radix UI Dialog components (Sheet uses Dialog primitives)
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-root">{children}</div>,
  Trigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sheet-trigger" data-as-child={asChild ? 'true' : 'false'}>
      {children}
    </div>
  ),
  Content: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sheet-content" className={className}>
      {children}
    </div>
  ),
  Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="sheet-title" className={className}>
      {children}
    </h2>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet-portal">{children}</div>,
  Overlay: ({ className }: { className?: string }) => <div data-testid="sheet-overlay" className={className} />,
  Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button data-testid="sheet-close" className={className}>
      {children}
    </button>
  ),
}));

// Mock @/libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  };
});

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from './Sheet';

describe('Sheet', () => {
  it('renders Sheet root correctly', () => {
    render(
      <Sheet>
        <div>Sheet Content</div>
      </Sheet>,
    );
    expect(screen.getByTestId('sheet-root')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('renders SheetTrigger correctly', () => {
    render(
      <SheetTrigger>
        <button>Open Sheet</button>
      </SheetTrigger>,
    );
    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open Sheet')).toBeInTheDocument();
  });

  it('renders SheetTrigger with asChild', () => {
    render(
      <SheetTrigger asChild>
        <button>Open Sheet</button>
      </SheetTrigger>,
    );
    const trigger = screen.getByTestId('sheet-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('renders SheetContent with default side', () => {
    render(
      <SheetContent>
        <div>Sheet Content</div>
      </SheetContent>,
    );
    expect(screen.getByTestId('sheet-portal')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
    expect(screen.getByText('Sheet Content')).toBeInTheDocument();
  });

  it('renders SheetContent with different sides', () => {
    const { rerender } = render(
      <SheetContent side="top">
        <div>Top Sheet</div>
      </SheetContent>,
    );
    expect(screen.getByText('Top Sheet')).toBeInTheDocument();

    rerender(
      <SheetContent side="bottom">
        <div>Bottom Sheet</div>
      </SheetContent>,
    );
    expect(screen.getByText('Bottom Sheet')).toBeInTheDocument();

    rerender(
      <SheetContent side="left">
        <div>Left Sheet</div>
      </SheetContent>,
    );
    expect(screen.getByText('Left Sheet')).toBeInTheDocument();

    rerender(
      <SheetContent side="right">
        <div>Right Sheet</div>
      </SheetContent>,
    );
    expect(screen.getByText('Right Sheet')).toBeInTheDocument();
  });

  it('renders SheetHeader correctly', () => {
    render(
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
      </SheetHeader>,
    );
    expect(screen.getByTestId('sheet-title')).toBeInTheDocument();
    expect(screen.getByText('Sheet Title')).toBeInTheDocument();
  });

  it('renders SheetTitle correctly', () => {
    render(<SheetTitle>My Sheet Title</SheetTitle>);
    const title = screen.getByTestId('sheet-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('My Sheet Title');
  });

  it('renders close button in SheetContent', () => {
    render(
      <SheetContent>
        <div>Sheet Content</div>
      </SheetContent>,
    );
    expect(screen.getByTestId('sheet-close')).toBeInTheDocument();
  });
});

describe('Sheet - Snapshots', () => {
  it('matches snapshot for Sheet with default props', () => {
    const { container } = render(
      <Sheet>
        <div>Sheet Content</div>
      </Sheet>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetTrigger with default props', () => {
    const { container } = render(
      <SheetTrigger>
        <button>Open Sheet</button>
      </SheetTrigger>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetTrigger with asChild', () => {
    const { container } = render(
      <SheetTrigger asChild>
        <button>Open Sheet</button>
      </SheetTrigger>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetContent with default side', () => {
    const { container } = render(
      <SheetContent>
        <div>Sheet Content</div>
      </SheetContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetContent with top side', () => {
    const { container } = render(
      <SheetContent side="top">
        <div>Top Sheet</div>
      </SheetContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetContent with bottom side', () => {
    const { container } = render(
      <SheetContent side="bottom">
        <div>Bottom Sheet</div>
      </SheetContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetContent with left side', () => {
    const { container } = render(
      <SheetContent side="left">
        <div>Left Sheet</div>
      </SheetContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetContent with right side', () => {
    const { container } = render(
      <SheetContent side="right">
        <div>Right Sheet</div>
      </SheetContent>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetHeader', () => {
    const { container } = render(
      <SheetHeader>
        <SheetTitle>Sheet Title</SheetTitle>
      </SheetHeader>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SheetTitle', () => {
    const { container } = render(<SheetTitle>My Sheet Title</SheetTitle>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
