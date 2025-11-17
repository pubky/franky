import { render } from '@testing-library/react';
import { PostThreadConnector } from './PostThreadConnector';

describe('PostThreadConnector', () => {
  describe('Functionality', () => {
    it('renders with regular variant by default', () => {
      const { container } = render(<PostThreadConnector height={100} data-testid="connector" />);
      const connector = container.querySelector('[data-testid="connector"]');
      expect(connector).toBeInTheDocument();
      expect(connector).toHaveAttribute('data-variant', 'regular');
    });

    it('renders with last variant', () => {
      const { container } = render(<PostThreadConnector height={100} variant="last" data-testid="connector" />);
      const connector = container.querySelector('[data-testid="connector"]');
      expect(connector).toHaveAttribute('data-variant', 'last');
    });

    it('renders with gap-fix variant', () => {
      const { container } = render(<PostThreadConnector height={100} variant="gap-fix" data-testid="connector" />);
      const connector = container.querySelector('[data-testid="connector"]');
      expect(connector).toHaveAttribute('data-variant', 'gap-fix');
    });

    it('applies custom height', () => {
      const { container } = render(<PostThreadConnector height={200} data-testid="connector" />);
      const connector = container.querySelector('[data-testid="connector"]');
      expect(connector).toHaveStyle({ height: '200px' });
    });

    it('renders without data-testid when not provided', () => {
      const { container } = render(<PostThreadConnector height={100} />);
      const connectors = container.querySelectorAll('[data-testid]');
      expect(connectors).toHaveLength(0);
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with regular variant', () => {
      const { container } = render(<PostThreadConnector height={100} variant="regular" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with last variant', () => {
      const { container } = render(<PostThreadConnector height={100} variant="last" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with gap-fix variant', () => {
      const { container } = render(<PostThreadConnector height={100} variant="gap-fix" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with small height', () => {
      const { container } = render(<PostThreadConnector height={50} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with large height', () => {
      const { container } = render(<PostThreadConnector height={300} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
