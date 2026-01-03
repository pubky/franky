import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostHeaderUserInfoPopoverFollowButton } from './PostHeaderUserInfoPopoverFollowButton';

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Loader2: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-loader2" {...props} />,
    Check: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-check" {...props} />,
    UserMinus: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-user-minus" {...props} />,
    UserRoundPlus: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-user-round-plus" {...props} />,
  };
});

describe('PostHeaderUserInfoPopoverFollowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Follow state when not following', () => {
    const onClick = vi.fn();
    render(<PostHeaderUserInfoPopoverFollowButton isFollowing={false} isLoading={false} onClick={onClick} />);

    const button = screen.getByLabelText('Follow');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders Unfollow state when following', () => {
    render(<PostHeaderUserInfoPopoverFollowButton isFollowing={true} isLoading={false} onClick={vi.fn()} />);
    expect(screen.getByLabelText('Unfollow')).toBeInTheDocument();
  });

  it('renders loading state and disables button', () => {
    render(<PostHeaderUserInfoPopoverFollowButton isFollowing={false} isLoading={true} onClick={vi.fn()} />);
    const button = screen.getByLabelText('Follow');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });
});

describe('PostHeaderUserInfoPopoverFollowButton - Snapshots', () => {
  it('matches snapshot for follow state', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverFollowButton isFollowing={false} isLoading={false} onClick={vi.fn()} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for following state', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverFollowButton isFollowing={true} isLoading={false} onClick={vi.fn()} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    const { container } = render(
      <PostHeaderUserInfoPopoverFollowButton isFollowing={false} isLoading={true} onClick={vi.fn()} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
