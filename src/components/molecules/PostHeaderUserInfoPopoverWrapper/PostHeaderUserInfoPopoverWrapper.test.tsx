import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PostHeaderUserInfoPopoverWrapper } from './PostHeaderUserInfoPopoverWrapper';
import { POPOVER_HOVER_DELAY } from './PostHeaderUserInfoPopoverWrapper.constants';

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return { ...actual, useIsTouchDevice: () => false };
});

vi.mock('./components/PostHeaderUserInfoPopoverContent/PostHeaderUserInfoPopoverContent', () => ({
  PostHeaderUserInfoPopoverContent: () => <div data-testid="popover-inner-content">Content</div>,
}));

describe('PostHeaderUserInfoPopoverWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not mount popover content until hovered', async () => {
    render(
      <PostHeaderUserInfoPopoverWrapper userId="user123" userName="Test User" formattedPublicKey="user123">
        <button data-testid="trigger" type="button">
          Trigger
        </button>
      </PostHeaderUserInfoPopoverWrapper>,
    );

    expect(screen.queryByTestId('popover-inner-content')).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByTestId('trigger'));

    // Popover should not appear immediately due to hover delay
    expect(screen.queryByTestId('popover-inner-content')).not.toBeInTheDocument();

    // Advance timers past the hover delay
    await act(async () => {
      vi.advanceTimersByTime(POPOVER_HOVER_DELAY);
    });

    expect(screen.getByTestId('popover-inner-content')).toBeInTheDocument();
  });
});
