import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DialogPostReplyThreadConnector } from './DialogPostReplyThreadConnector';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
  }) => (
    <div data-testid="container" className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
}));

vi.mock('@/libs', () => ({
  LineHorizontal: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" className="fill-secondary">
      <path fillRule="evenodd" clipRule="evenodd" d="M0 0h12v12H0z" />
    </svg>
  ),
}));

describe('DialogPostReplyThreadConnector', () => {
  it('renders connector elements', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);

    // Check that the main container is rendered
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toBeInstanceOf(HTMLDivElement);
    expect(wrapper).toHaveAttribute('data-testid', 'container');
  });

  it('renders vertical line with correct styling', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);

    const verticalLine = container.querySelector('.border-l.border-secondary');
    expect(verticalLine).toBeInTheDocument();
    expect(verticalLine).toHaveClass(
      'absolute',
      '-left-3',
      'top-[-13px]',
      'h-[35px]',
      'w-px',
      'border-l',
      'border-secondary',
    );
  });

  it('renders horizontal connector SVG', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
    expect(svg).toHaveAttribute('viewBox', '0 0 12 12');
    expect(svg).toHaveClass('fill-secondary');
  });

  it('renders SVG path element', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill-rule', 'evenodd');
    expect(path).toHaveAttribute('clip-rule', 'evenodd');
  });
});

describe('DialogPostReplyThreadConnector - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
