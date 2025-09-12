import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import { normaliseRadixIds } from '@/libs/utils/utils';

describe('Popover', () => {
  it('renders popover trigger and content', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: /open popover/i });
    expect(trigger).toBeInTheDocument();
  });

  it('shows content when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Content should appear after click
    expect(screen.getByText('Popover Content')).toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent className="custom-popover-class">
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const content = screen.getByText('Popover Content').parentElement;
    expect(content).toHaveClass('custom-popover-class');
  });

  it('has proper data attributes', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('data-slot', 'popover-trigger');

    fireEvent.click(trigger);

    const content = screen.getByText('Popover Content').parentElement;
    expect(content).toHaveAttribute('data-slot', 'popover-content');
  });
});

// Note: Radix UI generates incremental IDs (radix-«r0», radix-«r1», etc.) for aria-controls attributes.
// These IDs are deterministic within an identical test suite run but may change when a subset of tests are run or are run in a different order.
// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('Popover - Snapshots', () => {
  it('matches snapshot for PopoverTrigger with default props', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
      </Popover>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for PopoverTrigger with asChild', () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
      </Popover>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for popover trigger in open state', () => {
    const { container } = render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <button>Open Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <div>Popover Content</div>
        </PopoverContent>
      </Popover>,
    );
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
