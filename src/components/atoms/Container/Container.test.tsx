import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Container } from './Container';

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
