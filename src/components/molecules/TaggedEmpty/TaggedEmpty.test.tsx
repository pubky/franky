import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaggedEmpty } from './TaggedEmpty';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="image" data-src={src} data-alt={alt}>
      Image
    </div>
  ),
}));

// Mock TagInput
vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    TagInput: () => <div data-testid="tag-input">TagInput</div>,
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

  it('matches snapshot', () => {
    const { container } = render(<TaggedEmpty />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
