import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Globe, Twitter, Github } from 'lucide-react';
import { ProfilePageLinks, ProfilePageSidebarLink } from './ProfilePageLinks';

const defaultLinks: ProfilePageSidebarLink[] = [
  { icon: Globe, url: 'https://bitcoin.org', label: 'bitcoin.org' },
  { icon: Twitter, url: 'https://twitter.com/test', label: 'twitter.com/test' },
  { icon: Github, url: 'https://github.com/test', label: 'github.com/test' },
];

describe('ProfilePageLinks', () => {
  it('renders heading correctly', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders all links', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('renders links with correct href attributes', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks.forEach((link) => {
      const linkElement = screen.getByText(link.label).closest('a');
      expect(linkElement).toHaveAttribute('href', link.url);
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders with custom links', () => {
    const customLinks: ProfilePageSidebarLink[] = [{ icon: Globe, url: 'https://example.com', label: 'Example' }];
    render(<ProfilePageLinks links={customLinks} />);
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('Example').closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('has correct container structure', () => {
    const { container } = render(<ProfilePageLinks links={defaultLinks} />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('flex', 'flex-col');
  });

  it('applies correct link styling', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    const linkElement = screen.getByText('bitcoin.org').closest('a');
    expect(linkElement).toHaveClass('flex', 'items-center', 'gap-2.5', 'py-1');
  });

  it('renders no links message when links array is empty', () => {
    render(<ProfilePageLinks links={[]} />);
    expect(screen.getByText('No links added yet.')).toBeInTheDocument();
  });

  it('renders nothing when links is undefined', () => {
    render(<ProfilePageLinks />);
    expect(screen.queryByText('No links added yet.')).not.toBeInTheDocument();
  });
});

describe('ProfilePageLinks - Snapshots', () => {
  it('matches snapshot with links', () => {
    const { container } = render(<ProfilePageLinks links={defaultLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom links', () => {
    const customLinks: ProfilePageSidebarLink[] = [{ icon: Globe, url: 'https://example.com', label: 'Example' }];
    const { container } = render(<ProfilePageLinks links={customLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty links', () => {
    const { container } = render(<ProfilePageLinks links={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
