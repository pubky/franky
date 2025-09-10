import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Typography } from './Typography';

describe('Typography', () => {
  it('renders with default props', () => {
    render(<Typography>Default text</Typography>);

    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe('P');
    expect(text).toHaveClass('text-xl', 'font-semibold', 'text-foreground');
  });

  it('renders different HTML elements', () => {
    const { rerender } = render(<Typography as="h1">Heading</Typography>);

    let element = screen.getByText('Heading');
    expect(element.tagName).toBe('H1');

    rerender(<Typography as="span">Span text</Typography>);
    element = screen.getByText('Span text');
    expect(element.tagName).toBe('SPAN');

    rerender(<Typography as="strong">Strong text</Typography>);
    element = screen.getByText('Strong text');
    expect(element.tagName).toBe('STRONG');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Typography size="sm">Small text</Typography>);

    let text = screen.getByText('Small text');
    expect(text).toHaveClass('text-sm', 'font-semibold');

    rerender(<Typography size="lg">Large text</Typography>);
    text = screen.getByText('Large text');
    expect(text).toHaveClass('text-2xl', 'font-bold');

    rerender(<Typography size="xl">Extra large text</Typography>);
    text = screen.getByText('Extra large text');
    expect(text).toHaveClass('text-4xl', 'font-bold');
  });

  it('applies custom className', () => {
    render(<Typography className="custom-typography">Custom text</Typography>);

    const text = screen.getByText('Custom text');
    expect(text).toHaveClass('custom-typography');
  });

  it('combines as and size props correctly', () => {
    render(
      <Typography as="h2" size="lg">
        Large heading
      </Typography>,
    );

    const heading = screen.getByText('Large heading');
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('text-2xl', 'font-bold');
  });

  it('renders complex children correctly', () => {
    render(
      <Typography>
        <span>Complex</span> <em>typography</em> content
      </Typography>,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('typography')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});

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
