import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders with default props', () => {
    render(<Container data-testid="container">Test content</Container>);

    const container = screen.getByTestId('container');
    expect(container).toBeInTheDocument();
    expect(container.tagName).toBe('DIV');
    expect(container).toHaveClass('mx-auto', 'w-full', 'flex-col', 'flex');
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders different HTML elements', () => {
    const { rerender } = render(
      <Container as="section" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container.tagName).toBe('SECTION');

    rerender(
      <Container as="main" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container.tagName).toBe('MAIN');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <Container size="sm" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-sm');

    rerender(
      <Container size="md" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-md');

    rerender(
      <Container size="lg" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-lg');

    rerender(
      <Container size="xl" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('max-w-screen-xl');

    rerender(
      <Container size="container" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('container');
  });

  it('renders different display modes correctly', () => {
    const { rerender } = render(
      <Container display="grid" data-testid="container">
        Content
      </Container>,
    );

    let container = screen.getByTestId('container');
    expect(container).toHaveClass('grid');

    rerender(
      <Container display="block" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('block');

    rerender(
      <Container display="flex" data-testid="container">
        Content
      </Container>,
    );
    container = screen.getByTestId('container');
    expect(container).toHaveClass('flex');
  });

  it('applies custom className', () => {
    render(
      <Container className="custom-container" data-testid="container">
        Content
      </Container>,
    );

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-container');
  });

  it('combines all props correctly', () => {
    render(
      <Container as="article" size="lg" display="grid" className="custom" data-testid="container">
        Combined props content
      </Container>,
    );

    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('ARTICLE');
    expect(container).toHaveClass('mx-auto', 'w-full', 'flex-col', 'grid', 'max-w-screen-lg', 'custom');
  });
});

describe('Container - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Container>Default Container</Container>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different HTML elements', () => {
    const { container: divContainer } = render(<Container as="div">Div Container</Container>);
    expect(divContainer.firstChild).toMatchSnapshot();

    const { container: sectionContainer } = render(<Container as="section">Section Container</Container>);
    expect(sectionContainer.firstChild).toMatchSnapshot();

    const { container: mainContainer } = render(<Container as="main">Main Container</Container>);
    expect(mainContainer.firstChild).toMatchSnapshot();

    const { container: articleContainer } = render(<Container as="article">Article Container</Container>);
    expect(articleContainer.firstChild).toMatchSnapshot();

    const { container: headerContainer } = render(<Container as="header">Header Container</Container>);
    expect(headerContainer.firstChild).toMatchSnapshot();

    const { container: footerContainer } = render(<Container as="footer">Footer Container</Container>);
    expect(footerContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different sizes', () => {
    const { container: defaultContainer } = render(<Container size="default">Default Size</Container>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: smContainer } = render(<Container size="sm">Small Container</Container>);
    expect(smContainer.firstChild).toMatchSnapshot();

    const { container: mdContainer } = render(<Container size="md">Medium Container</Container>);
    expect(mdContainer.firstChild).toMatchSnapshot();

    const { container: lgContainer } = render(<Container size="lg">Large Container</Container>);
    expect(lgContainer.firstChild).toMatchSnapshot();

    const { container: xlContainer } = render(<Container size="xl">Extra Large Container</Container>);
    expect(xlContainer.firstChild).toMatchSnapshot();

    const { container: containerSizeContainer } = render(<Container size="container">Container Size</Container>);
    expect(containerSizeContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different display modes', () => {
    const { container: flexContainer } = render(<Container display="flex">Flex Container</Container>);
    expect(flexContainer.firstChild).toMatchSnapshot();

    const { container: gridContainer } = render(<Container display="grid">Grid Container</Container>);
    expect(gridContainer.firstChild).toMatchSnapshot();

    const { container: blockContainer } = render(<Container display="block">Block Container</Container>);
    expect(blockContainer.firstChild).toMatchSnapshot();
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
