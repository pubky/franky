import { render } from '@testing-library/react';
import { ThreadLine } from './ThreadLine';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    overrideDefaults,
    'data-testid': dataTestId,
  }: {
    children: React.ReactNode;
    className?: string;
    overrideDefaults?: boolean;
    'data-testid'?: string;
  }) => (
    <div data-testid={dataTestId} className={className} data-override-defaults={overrideDefaults}>
      {children}
    </div>
  ),
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('ThreadLine', () => {
  describe('Functionality', () => {
    it('renders thread line with default styling', () => {
      const { container } = render(<ThreadLine data-testid="thread-line" />);
      const threadLine = container.querySelector('[data-testid="thread-line"]');
      expect(threadLine).toBeInTheDocument();
      expect(threadLine).toHaveClass('border-l', 'border-border');
    });

    it('applies custom className', () => {
      const { container } = render(<ThreadLine className="custom-class" data-testid="thread-line" />);
      const threadLine = container.querySelector('[data-testid="thread-line"]');
      expect(threadLine).toHaveClass('custom-class');
    });

    it('uses overrideDefaults prop', () => {
      const { container } = render(<ThreadLine data-testid="thread-line" />);
      const threadLine = container.querySelector('[data-testid="thread-line"]');
      expect(threadLine).toHaveAttribute('data-override-defaults', 'true');
    });

    it('renders without data-testid when not provided', () => {
      const { container } = render(<ThreadLine />);
      const threadLine = container.firstChild;
      expect(threadLine).toBeInTheDocument();
      expect(threadLine).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<ThreadLine data-testid="thread-line" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<ThreadLine className="custom-class" data-testid="thread-line" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
