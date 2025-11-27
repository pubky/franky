import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaggedEmpty } from './TaggedEmpty';

// Mock useTagged hook
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useTagged: vi.fn(() => ({
      tags: [],
      count: 0,
      isLoading: false,
      handleTagAdd: vi.fn(),
    })),
  };
});

// Mock ProfilePageEmptyState and TagInput
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    ProfilePageEmptyState: ({
      imageSrc,
      imageAlt,
      icon: Icon,
      title,
      subtitle,
      children,
    }: {
      imageSrc: string;
      imageAlt: string;
      icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
      title: string;
      subtitle: React.ReactNode;
      children?: React.ReactNode;
    }) => (
      <div data-testid="empty-state">
        <div data-testid="image" data-src={imageSrc} data-alt={imageAlt} />
        <Icon data-testid="tag-icon" />
        <h3>{title}</h3>
        <div>{subtitle}</div>
        {children}
      </div>
    ),
    TagInput: ({ onTagAdd }: { onTagAdd: (tag: string) => void }) => (
      <div data-testid="tag-input" onClick={() => onTagAdd('test-tag')}>
        TagInput
      </div>
    ),
  };
});

describe('TaggedEmpty', () => {
  it('renders without errors', () => {
    const { container } = render(<TaggedEmpty />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays title and subtitle', () => {
    render(<TaggedEmpty />);
    expect(screen.getByText('Discover who tagged you')).toBeInTheDocument();
    expect(screen.getByText(/No one has tagged you yet/)).toBeInTheDocument();
  });

  it('renders TagInput', () => {
    render(<TaggedEmpty />);
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
  });

  it('renders Tag icon', () => {
    render(<TaggedEmpty />);
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<TaggedEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
