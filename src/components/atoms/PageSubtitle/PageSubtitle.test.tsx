import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageSubtitle } from './PageSubtitle';

describe('PageSubtitle', () => {
  it('renders with default props', () => {
    render(<PageSubtitle>Test subtitle</PageSubtitle>);

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle.tagName).toBe('H2');
    expect(subtitle).toHaveClass('text-xl', 'lg:text-2xl', 'text-muted-foreground', 'font-light', 'leading-normal');
  });

  it('applies custom className', () => {
    render(<PageSubtitle className="custom-subtitle">Test subtitle</PageSubtitle>);

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toHaveClass('custom-subtitle');
  });

  it('renders complex children correctly', () => {
    render(
      <PageSubtitle>
        <span>Complex</span> <strong>subtitle</strong> content
      </PageSubtitle>,
    );

    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('subtitle')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(
      <PageSubtitle data-testid="page-subtitle" id="subtitle-id">
        Test
      </PageSubtitle>,
    );

    const subtitle = screen.getByTestId('page-subtitle');
    expect(subtitle).toHaveAttribute('id', 'subtitle-id');
  });
});

describe('PageSubtitle - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<PageSubtitle>Test subtitle</PageSubtitle>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different HTML elements', () => {
    const { container: h2Container } = render(<PageSubtitle as="h2">H2 subtitle</PageSubtitle>);
    expect(h2Container.firstChild).toMatchSnapshot();

    const { container: h5Container } = render(<PageSubtitle as="h5">H5 subtitle</PageSubtitle>);
    expect(h5Container.firstChild).toMatchSnapshot();

    const { container: pContainer } = render(<PageSubtitle as="p">P subtitle</PageSubtitle>);
    expect(pContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<PageSubtitle>Default subtitle</PageSubtitle>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <PageSubtitle className="custom-subtitle">Custom subtitle</PageSubtitle>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: titlePropContainer } = render(<PageSubtitle title="Title prop subtitle" />);
    expect(titlePropContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children types', () => {
    const { container: simpleContainer } = render(<PageSubtitle>Simple subtitle</PageSubtitle>);
    expect(simpleContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <PageSubtitle>
        <span>Complex</span> <strong>subtitle</strong> content
      </PageSubtitle>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<PageSubtitle id="subtitle-id">Subtitle with ID</PageSubtitle>);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(
      <PageSubtitle data-testid="page-subtitle">Subtitle with test ID</PageSubtitle>,
    );
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();
  });
});
