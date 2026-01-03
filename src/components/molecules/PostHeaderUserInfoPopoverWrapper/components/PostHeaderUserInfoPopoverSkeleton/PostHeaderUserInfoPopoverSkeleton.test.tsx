import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PostHeaderUserInfoPopoverSkeleton } from './PostHeaderUserInfoPopoverSkeleton';

describe('PostHeaderUserInfoPopoverSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<PostHeaderUserInfoPopoverSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

describe('PostHeaderUserInfoPopoverSkeleton - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<PostHeaderUserInfoPopoverSkeleton />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
