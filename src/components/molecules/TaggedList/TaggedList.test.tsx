import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaggedList } from './TaggedList';
import type { NexusTag } from '@/core/services/nexus/nexus.types';

// Mock TaggedItem
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    TaggedItem: ({ tag }: { tag: NexusTag }) => <div data-testid="tagged-item">{tag.label}</div>,
  };
});

describe('TaggedList', () => {
  const mockTags: NexusTag[] = [
    {
      label: 'bitcoin',
      taggers: ['user1', 'user2'],
      taggers_count: 2,
      relationship: false,
    },
    {
      label: 'satoshi',
      taggers: ['user3'],
      taggers_count: 1,
      relationship: false,
    },
  ];

  it('renders all tags', () => {
    render(<TaggedList tags={mockTags} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('satoshi')).toBeInTheDocument();
  });

  it('renders empty list when no tags', () => {
    const { container } = render(<TaggedList tags={[]} />);
    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId('tagged-item')).not.toBeInTheDocument();
  });

  it('renders correct number of items', () => {
    render(<TaggedList tags={mockTags} />);
    const items = screen.getAllByTestId('tagged-item');
    expect(items).toHaveLength(2);
  });

  it('matches snapshot with tags', () => {
    const { container } = render(<TaggedList tags={mockTags} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty tags', () => {
    const { container } = render(<TaggedList tags={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
