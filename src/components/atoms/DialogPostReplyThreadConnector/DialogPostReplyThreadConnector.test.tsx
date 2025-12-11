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

describe('DialogPostReplyThreadConnector', () => {
  it('renders expected elements', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);

    // Check that the main container is rendered
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toBeInstanceOf(HTMLDivElement);
    expect(wrapper).toHaveAttribute('data-testid', 'container');
    const verticalLine = container.querySelector('.border-l.border-secondary');
    expect(verticalLine).toBeInTheDocument();
  });
});

describe('DialogPostReplyThreadConnector - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<DialogPostReplyThreadConnector />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
