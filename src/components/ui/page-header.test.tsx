import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('should render title correctly', () => {
    render(<PageHeader title="Test Title" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
  });

  it('should render title and subtitle', () => {
    render(<PageHeader title="Test Title" subtitle="Test subtitle" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('should render JSX title with styled content', () => {
    render(
      <PageHeader
        title={
          <>
            Hello <span className="text-green-500">world</span>
          </>
        }
      />,
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Hello world');
    expect(heading.querySelector('.text-green-500')).toHaveTextContent('world');
  });

  it('should render with action button', () => {
    const actionButton = <button>Action Button</button>;

    render(<PageHeader title="Test Title" action={actionButton} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<PageHeader title="Test Title" className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should not render subtitle when not provided', () => {
    render(<PageHeader title="Test Title" />);

    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });

  it('should not render action when not provided', () => {
    render(<PageHeader title="Test Title" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should apply custom title className', () => {
    render(<PageHeader title="Test Title" titleClassName="custom-title-class" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('custom-title-class');
  });

  it('should apply custom subtitle className', () => {
    render(<PageHeader title="Test Title" subtitle="Test subtitle" subtitleClassName="custom-subtitle-class" />);

    const subtitle = screen.getByText('Test subtitle');
    expect(subtitle).toHaveClass('custom-subtitle-class');
  });
});
