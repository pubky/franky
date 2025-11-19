import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageTaggedAs } from './ProfilePageTaggedAs';
import { DEFAULT_TAGS } from './ProfilePageTaggedAs';

describe('ProfilePageTaggedAs', () => {
  it('renders heading correctly', () => {
    render(<ProfilePageTaggedAs />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
  });

  it('renders all default tags', () => {
    render(<ProfilePageTaggedAs />);
    DEFAULT_TAGS.forEach((tag) => {
      expect(screen.getByTestId(`tag-${DEFAULT_TAGS.indexOf(tag)}`)).toBeInTheDocument();
    });
  });

  it('renders search buttons for each tag', () => {
    const { container } = render(<ProfilePageTaggedAs />);
    const searchButtons = container.querySelectorAll('button[data-variant="secondary"]');
    expect(searchButtons.length).toBe(DEFAULT_TAGS.length);
  });

  it('renders Add Tag button', () => {
    render(<ProfilePageTaggedAs />);
    const addTagButton = screen.getByText('Add Tag');
    expect(addTagButton).toBeInTheDocument();
  });

  it('Add Tag button has correct styling', () => {
    render(<ProfilePageTaggedAs />);
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
    const { container } = render(<ProfilePageTaggedAs />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('flex', 'flex-col', 'gap-2');
  });
});

describe('ProfilePageTaggedAs - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<ProfilePageTaggedAs />);
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
});
