import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { normaliseRadixIds } from '@/libs/utils/utils';

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

// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('Dialog - Snapshots', () => {
  it('matches snapshot for Dialog with default props', () => {
    const { container } = render(
      <Dialog>
        <div>Dialog Content</div>
      </Dialog>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogTrigger with default props', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
      </Dialog>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogTrigger with asChild', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>
      </Dialog>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent with default props', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent with close button', () => {
    render(
      <Dialog open={true}>
        <DialogContent showCloseButton={true}>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent without close button', () => {
    render(
      <Dialog open={true}>
        <DialogContent showCloseButton={false}>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent with overrideDefaults', () => {
    render(
      <Dialog open={true}>
        <DialogContent overrideDefaults={true}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogContent without overrideDefaults', () => {
    render(
      <Dialog open={true}>
        <DialogContent overrideDefaults={false}>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogHeader', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    const dialogHeader = screen.getByTestId('dialog-header');
    const normalizedContainer = normaliseRadixIds(dialogHeader);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for DialogFooter', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogFooter>
            <button>Cancel</button>
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    const dialogContent = screen.getByTestId('dialog-content');
    const footer = dialogContent.querySelector('[data-slot="dialog-footer"]');
    const normalizedContainer = normaliseRadixIds(footer as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });

  it('matches snapshot for complete dialog structure', () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>Open Dialog</DialogTrigger>
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
    const dialogContent = screen.getByTestId('dialog-content');
    const normalizedContainer = normaliseRadixIds(dialogContent.parentElement as HTMLElement);
    expect(normalizedContainer).toMatchSnapshot();
  });
});
