import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostMain } from './PostMain';

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    PostHeader: ({ displayName, label, timeLabel }: { displayName: string; label: string; timeLabel: string }) => (
      <div data-testid="header">
        <div>{displayName}</div>
        <div>{label}</div>
        <div>{timeLabel}</div>
      </div>
    ),
    PostContent: ({ text }: { text: string }) => <div data-testid="content">{text}</div>,
    PostTagsList: ({ tags }: { tags?: { label: string }[] }) => (
      <div data-testid="tags">{tags?.map((t: { label: string }) => t.label).join(',')}</div>
    ),
    PostActionsBar: ({
      tagCount,
      replyCount,
      repostCount,
    }: {
      tagCount?: number;
      replyCount?: number;
      repostCount?: number;
    }) => <div data-testid="actions">{`${tagCount}-${replyCount}-${repostCount}`}</div>,
  };
});

describe('PostMain', () => {
  it('renders all sections', () => {
    render(
      <PostMain
        displayName="Satoshi Nakamoto"
        label="1YXP...7R32"
        timeLabel="15m"
        text="Hello"
        tags={[{ label: 'bitcoin' }]}
      />,
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('tags')).toHaveTextContent('bitcoin');
    expect(screen.getByTestId('actions')).toHaveTextContent('5-7-3');
  });

  it('matches snapshot', () => {
    const { container } = render(
      <PostMain
        displayName="Satoshi Nakamoto"
        label="1YXP...7R32"
        timeLabel="15m"
        text="Hello"
        tags={[{ label: 'bitcoin' }]}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
