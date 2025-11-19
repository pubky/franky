import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageSidebar } from './ProfilePageSidebar';

describe('ProfilePageSidebar', () => {
  it('renders ProfilePageTaggedAs component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
  });

  it('renders ProfilePageLinks component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders FeedbackCard component', () => {
    render(<ProfilePageSidebar />);
    expect(screen.getByTestId('feedback-card')).toBeInTheDocument();
  });

  it('has correct structure with sticky positioning', () => {
    const { container } = render(<ProfilePageSidebar />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass(
      'sticky',
      'top-(--header-height)',
      'hidden',
      'w-(--filter-bar-width)',
      'flex-col',
      'gap-6',
      'self-start',
      'lg:flex',
    );
  });

  it('renders with custom tags', () => {
    const customTags = [
      { name: 'custom1', count: 10 },
      { name: 'custom2', count: 20 },
    ];
    render(<ProfilePageSidebar tags={customTags} />);
    expect(screen.getByTestId('tag-0')).toBeInTheDocument();
    expect(screen.getByTestId('tag-1')).toBeInTheDocument();
  });

  it('renders with custom links', () => {
    const customLinks = [{ icon: () => <span>Icon</span>, url: 'https://example.com', label: 'Example' }];
    render(<ProfilePageSidebar links={customLinks} />);
    expect(screen.getByText('Example')).toBeInTheDocument();
  });
});

describe('ProfilePageSidebar - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ProfilePageSidebar />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom tags and links', () => {
    const customTags = [
      { name: 'custom1', count: 10 },
      { name: 'custom2', count: 20 },
    ];
    const customLinks = [{ icon: () => <span>Icon</span>, url: 'https://example.com', label: 'Example' }];
    const { container } = render(<ProfilePageSidebar tags={customTags} links={customLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
