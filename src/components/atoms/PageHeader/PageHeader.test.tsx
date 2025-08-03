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
