import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageLinks } from './ProfilePageLinks';
import * as Core from '@/core';

// Mock Icons
vi.mock('@/libs/icons', () => ({
  getIconFromUrl: () => {
    const MockIcon = ({ size, className }: { size: number; className: string }) => (
      <span data-testid="mock-icon" data-size={size} className={className}>
        Icon
      </span>
    );
    return MockIcon;
  },
}));

const defaultLinks: Core.NexusUserDetails['links'] = [
  { title: 'bitcoin.org', url: 'https://bitcoin.org' },
  { title: 'twitter.com/test', url: 'https://twitter.com/test' },
  { title: 'github.com/test', url: 'https://github.com/test' },
];

describe('ProfilePageLinks', () => {
  it('renders heading correctly', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders all links', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks?.forEach((link) => {
      expect(screen.getByText(link.title)).toBeInTheDocument();
    });
  });

  it('renders links with correct href attributes', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks?.forEach((link) => {
      const linkElement = screen.getByText(link.title).closest('a');
      expect(linkElement).toHaveAttribute('href', link.url);
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders with custom links', () => {
    const customLinks: Core.NexusUserDetails['links'] = [{ title: 'Example', url: 'https://example.com' }];
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

  it('renders no links message when links is undefined', () => {
    render(<ProfilePageLinks />);
    expect(screen.getByText('No links added yet.')).toBeInTheDocument();
  });
});

describe('ProfilePageLinks - Snapshots', () => {
  it('matches snapshot with links', () => {
    const { container } = render(<ProfilePageLinks links={defaultLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom links', () => {
    const customLinks: Core.NexusUserDetails['links'] = [{ title: 'Example', url: 'https://example.com' }];
    const { container } = render(<ProfilePageLinks links={customLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty links', () => {
    const { container } = render(<ProfilePageLinks links={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
