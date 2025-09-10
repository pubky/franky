import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders with default props', () => {
    const { container } = render(<PageHeader>Header content</PageHeader>);

    const header = container.firstChild as HTMLElement;
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'flex-col', 'gap-3');
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <PageHeader>
        <h1>Page Title</h1>
        <p>Page Subtitle</p>
      </PageHeader>,
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Page Subtitle')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<PageHeader className="custom-header">Header content</PageHeader>);

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom-header');
  });

  it('maintains default flex structure', () => {
    const { container } = render(<PageHeader>Content</PageHeader>);

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('flex', 'flex-col', 'gap-3');
  });

  it('renders with complex children', () => {
    render(
      <PageHeader>
        <div>
          <span>
            Complex <strong>Title</strong>
          </span>
          <span>
            Complex <em>Subtitle</em>
          </span>
        </div>
      </PageHeader>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    const { container } = render(
      <PageHeader data-testid="page-header" id="header-id">
        Content
      </PageHeader>,
    );

    const header = container.firstChild as HTMLElement;
    expect(header).toHaveAttribute('data-testid', 'page-header');
    expect(header).toHaveAttribute('id', 'header-id');
  });
});

describe('PageHeader - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<PageHeader>Header content</PageHeader>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<PageHeader>Default header</PageHeader>);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(
      <PageHeader className="custom-header">Custom header</PageHeader>,
    );
    expect(customClassContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different children types', () => {
    const { container: simpleContainer } = render(<PageHeader>Simple content</PageHeader>);
    expect(simpleContainer.firstChild).toMatchSnapshot();

    const { container: complexContainer } = render(
      <PageHeader>
        <h1>Page Title</h1>
        <p>Page Subtitle</p>
      </PageHeader>,
    );
    expect(complexContainer.firstChild).toMatchSnapshot();

    const { container: nestedContainer } = render(
      <PageHeader>
        <div>
          <span>
            Complex <strong>Title</strong>
          </span>
          <span>
            Complex <em>Subtitle</em>
          </span>
        </div>
      </PageHeader>,
    );
    expect(nestedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<PageHeader id="header-id">Header with ID</PageHeader>);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(
      <PageHeader data-testid="page-header">Header with test ID</PageHeader>,
    );
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();
  });
});
