import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders with default props', () => {
    render(<Heading>Default Heading</Heading>);
    const heading = screen.getByText('Default Heading');
    expect(heading).toBeInTheDocument();
  });
});

describe('Heading - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Heading>Default Heading</Heading>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different heading levels', () => {
    const { container: h1Container } = render(<Heading level={1}>H1 Heading</Heading>);
    expect(h1Container.firstChild).toMatchSnapshot();

    const { container: h2Container } = render(<Heading level={2}>H2 Heading</Heading>);
    expect(h2Container.firstChild).toMatchSnapshot();

    const { container: h3Container } = render(<Heading level={3}>H3 Heading</Heading>);
    expect(h3Container.firstChild).toMatchSnapshot();

    const { container: h4Container } = render(<Heading level={4}>H4 Heading</Heading>);
    expect(h4Container.firstChild).toMatchSnapshot();

    const { container: h5Container } = render(<Heading level={5}>H5 Heading</Heading>);
    expect(h5Container.firstChild).toMatchSnapshot();

    const { container: h6Container } = render(<Heading level={6}>H6 Heading</Heading>);
    expect(h6Container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different sizes', () => {
    const { container: smContainer } = render(<Heading size="sm">Small Heading</Heading>);
    expect(smContainer.firstChild).toMatchSnapshot();

    const { container: mdContainer } = render(<Heading size="md">Medium Heading</Heading>);
    expect(mdContainer.firstChild).toMatchSnapshot();

    const { container: lgContainer } = render(<Heading size="lg">Large Heading</Heading>);
    expect(lgContainer.firstChild).toMatchSnapshot();

    const { container: xlContainer } = render(<Heading size="xl">Extra Large Heading</Heading>);
    expect(xlContainer.firstChild).toMatchSnapshot();

    const { container: xl2Container } = render(<Heading size="2xl">2XL Heading</Heading>);
    expect(xl2Container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for combined level and size', () => {
    const { container: combinedContainer } = render(
      <Heading level={3} size="2xl">
        H3 2XL Heading
      </Heading>,
    );
    expect(combinedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for custom className', () => {
    const { container: customContainer } = render(<Heading className="custom-heading-class">Custom Heading</Heading>);
    expect(customContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for complex children', () => {
    const { container: complexContainer } = render(
      <Heading>
        <span>Part 1</span> and <strong>Part 2</strong>
      </Heading>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });
});
