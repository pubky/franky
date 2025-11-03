import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyPost } from './DialogReplyPost';
import * as Organisms from '@/organisms';

vi.mock('@/organisms', () => ({
  PostHeader: vi.fn(({ postId, avatarSize }) => (
    <div data-testid="post-header" data-avatar-size={avatarSize}>
      {postId}
    </div>
  )),
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

  it('applies custom className', () => {
    const { container } = render(<DialogReplyPost postId="test-post-id" className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('passes avatarSize="default" to PostHeader', () => {
    const { getByTestId } = render(<DialogReplyPost postId="test-post-id" />);

    const postHeader = getByTestId('post-header');
    expect(postHeader).toHaveAttribute('data-avatar-size', 'default');
    expect(Organisms.PostHeader).toHaveBeenCalledTimes(1);
    const callArgs = (Organisms.PostHeader as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArgs).toMatchObject({
      postId: 'test-post-id',
      avatarSize: 'default',
    });
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

  it('matches snapshot with custom className', () => {
    const { container } = render(<DialogReplyPost postId="snapshot-post-id" className="test-class" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
