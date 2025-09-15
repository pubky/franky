import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageHeader } from './PageHeader';

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
