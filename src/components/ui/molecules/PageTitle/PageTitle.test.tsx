import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('renders with default props', () => {
    render(<PageTitle>Test Title</PageTitle>);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Test Title');
  });

  it('applies basic styling classes', () => {
    render(<PageTitle>Test Title</PageTitle>);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('font-bold');
    expect(title.className).toContain('text-5xl');
  });

  it('applies medium size classes when specified', () => {
    render(<PageTitle size="medium">Test Title</PageTitle>);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('font-bold');
    expect(title.className).toContain('text-4xl');
  });

  it('applies custom className', () => {
    render(<PageTitle className="custom-class">Test Title</PageTitle>);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('custom-class');
  });

  it('renders complex children', () => {
    render(
      <PageTitle>
        Test <span>Title</span> with <strong>markup</strong>
      </PageTitle>,
    );

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('markup')).toBeInTheDocument();
  });
});
