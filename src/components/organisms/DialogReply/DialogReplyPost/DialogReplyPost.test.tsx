import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyPost } from './DialogReplyPost';

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId }) => <div data-testid="post-header">{postId}</div>),
  PostContent: vi.fn(({ postId }) => <div data-testid="post-content">{postId}</div>),
}));

// Use real libs, only stub cn to a deterministic join
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
  };
});

describe('DialogReplyPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PostHeader and PostContent with correct postId', () => {
    const { getByTestId } = render(<DialogReplyPost postId="test-post-id" />);

    expect(getByTestId('post-header')).toBeInTheDocument();
    expect(getByTestId('post-header')).toHaveTextContent('test-post-id');
    expect(getByTestId('post-content')).toBeInTheDocument();
    expect(getByTestId('post-content')).toHaveTextContent('test-post-id');
  });
});

describe('DialogReplyPost - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<DialogReplyPost postId="snapshot-post-id" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
