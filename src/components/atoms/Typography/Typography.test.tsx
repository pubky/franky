import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Typography>Default text</Typography>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different HTML elements', () => {
    const { container: h1Container } = render(<Typography as="h1">H1 heading</Typography>);
    expect(h1Container.firstChild).toMatchSnapshot();

    const { container: h2Container } = render(<Typography as="h2">H2 heading</Typography>);
    expect(h2Container.firstChild).toMatchSnapshot();

    const { container: spanContainer } = render(<Typography as="span">Span text</Typography>);
    expect(spanContainer.firstChild).toMatchSnapshot();

    const { container: strongContainer } = render(<Typography as="strong">Strong text</Typography>);
    expect(strongContainer.firstChild).toMatchSnapshot();

    const { container: emContainer } = render(<Typography as="em">Emphasized text</Typography>);
    expect(emContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different sizes', () => {
    const { container: smContainer } = render(<Typography size="sm">Small text</Typography>);
    expect(smContainer.firstChild).toMatchSnapshot();

    const { container: mdContainer } = render(<Typography size="md">Medium text</Typography>);
    expect(mdContainer.firstChild).toMatchSnapshot();

    const { container: lgContainer } = render(<Typography size="lg">Large text</Typography>);
    expect(lgContainer.firstChild).toMatchSnapshot();

    const { container: xlContainer } = render(<Typography size="xl">Extra large text</Typography>);
    expect(xlContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<Typography>Default typography</Typography>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <Typography className="custom-typography">Custom typography</Typography>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: combinedContainer } = render(
      <Typography as="h2" size="lg">
        Large heading
      </Typography>,
    );
    expect(combinedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children types', () => {
    const { container: simpleContainer } = render(<Typography>Simple text</Typography>);
    expect(simpleContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <Typography>
        <span>Complex</span> <em>typography</em> content
      </Typography>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<Typography id="typography-id">Typography with ID</Typography>);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(
      <Typography data-testid="custom-typography">Typography with test ID</Typography>,
    );
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();
  });
});
