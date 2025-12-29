import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostHeaderUserInfoPopoverWrapper } from './PostHeaderUserInfoPopoverWrapper';

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

    await waitFor(() => {
      expect(screen.getByTestId('popover-inner-content')).toBeInTheDocument();
    });
  });
});
