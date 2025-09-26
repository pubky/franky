import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders with default props', () => {
    render(<Container>Default Container</Container>);
    const container = screen.getByText('Default Container');
    expect(container).toBeInTheDocument();
  });
});

describe('Container - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Container>Default Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for div element', () => {
    const { container } = render(<Container as="div">Div Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for section element', () => {
    const { container } = render(<Container as="section">Section Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for main element', () => {
    const { container } = render(<Container as="main">Main Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for article element', () => {
    const { container } = render(<Container as="article">Article Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for header element', () => {
    const { container } = render(<Container as="header">Header Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for footer element', () => {
    const { container } = render(<Container as="footer">Footer Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for default size', () => {
    const { container } = render(<Container size="default">Default Size</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for small size', () => {
    const { container } = render(<Container size="sm">Small Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for medium size', () => {
    const { container } = render(<Container size="md">Medium Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for large size', () => {
    const { container } = render(<Container size="lg">Large Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for extra large size', () => {
    const { container } = render(<Container size="xl">Extra Large Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for container size', () => {
    const { container } = render(<Container size="container">Container Size</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for flex display', () => {
    const { container } = render(<Container display="flex">Flex Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for grid display', () => {
    const { container } = render(<Container display="grid">Grid Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for block display', () => {
    const { container } = render(<Container display="block">Block Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for combined props', () => {
    const { container: combinedContainer } = render(
      <Container as="article" size="lg" display="grid" className="custom-class">
        Combined Props Container
      </Container>,
    );
    expect(combinedContainer.firstChild).toMatchSnapshot();
  });
});
