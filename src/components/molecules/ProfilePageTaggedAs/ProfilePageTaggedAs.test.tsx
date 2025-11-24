import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageTaggedAs } from './ProfilePageTaggedAs';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const defaultTags = [
  { name: 'bitcoin', count: 5 },
  { name: 'nostr', count: 3 },
  { name: 'web3', count: 2 },
];

describe('ProfilePageTaggedAs', () => {
  it('renders heading correctly', () => {
    render(<ProfilePageTaggedAs tags={defaultTags} />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
  });

  it('renders all tags', () => {
    render(<ProfilePageTaggedAs tags={defaultTags} />);
    defaultTags.forEach((_, index) => {
      expect(screen.getByTestId(`tag-${index}`)).toBeInTheDocument();
    });
  });

  it('renders search buttons for each tag', () => {
    const { container } = render(<ProfilePageTaggedAs tags={defaultTags} />);
    const searchButtons = container.querySelectorAll('button[data-variant="secondary"]');
    expect(searchButtons.length).toBe(defaultTags.length);
  });

  it('renders Add Tag button', () => {
    render(<ProfilePageTaggedAs tags={defaultTags} />);
    const addTagButton = screen.getByText('Add Tag');
    expect(addTagButton).toBeInTheDocument();
  });

  it('Add Tag button has correct styling', () => {
    render(<ProfilePageTaggedAs tags={defaultTags} />);
    const addTagButton = screen.getByText('Add Tag').closest('button');
    expect(addTagButton).toHaveClass('border', 'border-border', 'bg-foreground/5');
  });

  it('renders with custom tags', () => {
    const customTags = [
      { name: 'custom1', count: 10 },
      { name: 'custom2', count: 20 },
    ];
    render(<ProfilePageTaggedAs tags={customTags} />);
    expect(screen.getByTestId('tag-0')).toBeInTheDocument();
    expect(screen.getByTestId('tag-1')).toBeInTheDocument();
  });

  it('has correct container structure', () => {
    const { container } = render(<ProfilePageTaggedAs tags={defaultTags} />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('flex', 'flex-col', 'gap-2');
  });

  it('renders no tags message when tags array is empty', () => {
    render(<ProfilePageTaggedAs tags={[]} />);
    expect(screen.getByText('No tags added yet.')).toBeInTheDocument();
  });

  it('does not render no tags message when tags exist', () => {
    render(<ProfilePageTaggedAs tags={defaultTags} />);
    expect(screen.queryByText('No tags added yet.')).not.toBeInTheDocument();
  });
});

describe('ProfilePageTaggedAs - Snapshots', () => {
  it('matches snapshot with tags', () => {
    const { container } = render(<ProfilePageTaggedAs tags={defaultTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom tags', () => {
    const customTags = [
      { name: 'custom1', count: 10 },
      { name: 'custom2', count: 20 },
    ];
    const { container } = render(<ProfilePageTaggedAs tags={customTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty tags', () => {
    const { container } = render(<ProfilePageTaggedAs tags={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
