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
        <PopoverTrigger>
          <button>Open Popover</button>
        </PopoverTrigger>
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

  // TODO: address null output
  // it('matches snapshot for PopoverContent with default props', () => {
  //   const { container } = render(
  //     <Popover>
  //       <PopoverContent>
  //         <div>Popover Content</div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   const normalizedContainer = normalizeRadixIds(container);
  //   expect(normalizedContainer).toMatchSnapshot();
  // });

  // TODO: address null output
  // it('matches snapshots for PopoverContent with different configurations', () => {
  //   const { container: defaultContainer } = render(
  //     <Popover>
  //       <PopoverContent>
  //         <div>Default content</div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   expect(defaultContainer.firstChild).toMatchSnapshot();

  //   const { container: customClassContainer } = render(
  //     <Popover>
  //       <PopoverContent className="custom-popover-class">
  //         <div>Custom content</div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   expect(customClassContainer.firstChild).toMatchSnapshot();

  //   const { container: customAlignContainer } = render(
  //     <Popover>
  //       <PopoverContent align="start">
  //         <div>Start aligned content</div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   expect(customAlignContainer.firstChild).toMatchSnapshot();
  // });

  // TODO: address null output
  // it('matches snapshots for different content types', () => {
  //   const { container: simpleContainer } = render(
  //     <Popover>
  //       <PopoverContent>
  //         <div>Simple content</div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   expect(simpleContainer.firstChild).toMatchSnapshot();

  //   const { container: complexContainer } = render(
  //     <Popover>
  //       <PopoverContent>
  //         <div>
  //           <h3>Complex Content</h3>
  //           <p>With multiple elements</p>
  //           <button>Action</button>
  //         </div>
  //       </PopoverContent>
  //     </Popover>,
  //   );
  //   expect(complexContainer.firstChild).toMatchSnapshot();
  // });

  it('matches snapshot for complete popover structure', () => {
    const { container } = render(
      <Popover>
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
