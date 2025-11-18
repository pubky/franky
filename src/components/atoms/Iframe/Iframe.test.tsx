import { render, screen } from '@testing-library/react';
import { Iframe } from './Iframe';

describe('Iframe', () => {
  it('renders with required props', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" />);
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/embed');
    expect(iframe).toHaveAttribute('title', 'Example embed');
  });

  it('renders with custom data-testid', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" data-testid="custom-iframe" />);

    expect(screen.getByTestId('custom-iframe')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" />);
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toHaveClass('rounded-md');
  });

  it('merges custom className with default classes', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" className="custom-class" />);
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toHaveClass('rounded-md');
    expect(iframe).toHaveClass('custom-class');
  });

  it('has lazy loading by default', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" />);
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toHaveAttribute('loading', 'lazy');
  });

  it('has allowFullScreen by default', () => {
    render(<Iframe src="https://example.com/embed" title="Example embed" />);
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toHaveAttribute('allowFullScreen');
  });

  it('accepts additional iframe props', () => {
    render(
      <Iframe
        src="https://example.com/embed"
        title="Example embed"
        width="640"
        height="360"
        allow="accelerometer; autoplay"
        sandbox="allow-scripts allow-same-origin"
      />,
    );
    const iframe = screen.getByTestId('iframe');

    expect(iframe).toHaveAttribute('width', '640');
    expect(iframe).toHaveAttribute('height', '360');
    expect(iframe).toHaveAttribute('allow', 'accelerometer; autoplay');
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
  });
});

describe('Iframe - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <Iframe
        src="https://example.com/embed"
        title="Example embed"
        width="100%"
        height="315"
        data-testid="test-iframe"
      />,
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
