import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DialogReplyInput } from './DialogReplyInput';
import { POST_INPUT_VARIANT } from '@/organisms/PostInput/PostInput.constants';
import * as Organisms from '@/organisms';

vi.mock('@/organisms', () => ({
  PostInput: vi.fn(({ variant, postId, showThreadConnector }) => (
    <div data-testid="post-input" data-variant={variant} data-post-id={postId} data-show-thread={showThreadConnector}>
      PostInput Component
    </div>
  )),
}));

describe('DialogReplyInput', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PostInput with correct props', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    expect(Organisms.PostInput).toHaveBeenCalledWith(
      {
        variant: POST_INPUT_VARIANT.REPLY,
        postId: 'test-post-123',
        onSuccess: mockOnSuccess,
        showThreadConnector: true,
      },
      undefined,
    );
  });

  it('renders PostInput component', () => {
    render(<DialogReplyInput postId="test-post-123" onSuccessAction={mockOnSuccess} />);

    const postInput = screen.getByTestId('post-input');
    expect(postInput).toBeInTheDocument();
    expect(postInput).toHaveAttribute('data-variant', POST_INPUT_VARIANT.REPLY);
    expect(postInput).toHaveAttribute('data-post-id', 'test-post-123');
    expect(postInput).toHaveAttribute('data-show-thread', 'true');
  });
});

describe('DialogReplyInput - Snapshots', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<DialogReplyInput postId="snapshot-post-id" onSuccessAction={mockOnSuccess} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
