import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaggedSection } from './TaggedSection';

// Mock hooks
vi.mock('@/hooks', () => ({
  useCurrentUserProfile: () => ({
    userDetails: { name: 'Satoshi' },
  }),
  useTagged: () => ({
    tags: [{ label: 'bitcoin', taggers: [], taggers_count: 0, relationship: false }],
    handleTagAdd: vi.fn(),
  }),
}));

// Mock TagInput and TaggedList
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    TagInput: () => <div data-testid="tag-input">TagInput</div>,
    TaggedList: ({ tags }: { tags: unknown[] }) => <div data-testid="tagged-list">{tags.length} tags</div>,
  };
});

describe('TaggedSection', () => {
  it('renders user name in header', () => {
    render(<TaggedSection />);
    expect(screen.getByText('Satoshi was tagged as:')).toBeInTheDocument();
  });

  it('renders TagInput', () => {
    render(<TaggedSection />);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  it('renders TaggedList', () => {
    render(<TaggedSection />);
    expect(screen.getByTestId('tagged-list')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<TaggedSection />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
