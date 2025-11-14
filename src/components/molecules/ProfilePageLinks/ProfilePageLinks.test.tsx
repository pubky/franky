import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageLinks } from './ProfilePageLinks';
import { DEFAULT_LINKS } from './ProfilePageLinks';

describe('ProfilePageLinks', () => {
  it('renders heading correctly', () => {
    render(<ProfilePageLinks />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders all default links', () => {
    render(<ProfilePageLinks />);
    DEFAULT_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('renders links with correct href attributes', () => {
    render(<ProfilePageLinks />);
    DEFAULT_LINKS.forEach((link) => {
      const linkElement = screen.getByText(link.label).closest('a');
      expect(linkElement).toHaveAttribute('href', link.url);
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders with custom links', () => {
    const customLinks = [{ icon: () => <span>Icon</span>, url: 'https://example.com', label: 'Example' }];
    render(<ProfilePageLinks links={customLinks} />);
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('Example').closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('has correct container structure', () => {
    const { container } = render(<ProfilePageLinks />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('flex', 'flex-col');
  });

  it('applies correct link styling', () => {
    render(<ProfilePageLinks />);
    const linkElement = screen.getByText('bitcoin.org').closest('a');
    expect(linkElement).toHaveClass('flex', 'items-center', 'gap-2.5', 'py-1');
  });
});

describe('ProfilePageLinks - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ProfilePageLinks />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom links', () => {
    const customLinks = [{ icon: () => <span>Icon</span>, url: 'https://example.com', label: 'Example' }];
    const { container } = render(<ProfilePageLinks links={customLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
