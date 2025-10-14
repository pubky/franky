import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmojiPickerModal } from './EmojiPickerModal';

// Mock the EmojiPicker component
vi.mock('@/atoms', () => ({
  EmojiPicker: ({ onEmojiSelect }: { onEmojiSelect: (emoji: { native: string }) => void }) => (
    <div data-testid="emoji-picker">
      <button onClick={() => onEmojiSelect({ native: '😀' })}>Select Emoji</button>
    </div>
  ),
}));

describe('EmojiPickerModal', () => {
  const defaultProps = {
    show: true,
    customStatus: 'Custom status',
    emojiPickerRef: { current: null },
    onEmojiSelect: vi.fn(),
    onClose: vi.fn(),
    onContentClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when show is true', () => {
    render(<EmojiPickerModal {...defaultProps} />);

    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<EmojiPickerModal {...defaultProps} show={false} />);

    expect(screen.queryByTestId('emoji-picker')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking outside the modal', () => {
    render(<EmojiPickerModal {...defaultProps} />);

    const modal = screen.getByTestId('emoji-picker').closest('[class*="fixed"]');
    if (modal) {
      fireEvent.click(modal);
    }

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onContentClick when clicking inside the modal content', () => {
    render(<EmojiPickerModal {...defaultProps} />);

    const content = screen.getByTestId('emoji-picker').closest('[class*="bg-background"]');
    if (content) {
      fireEvent.click(content);
    }

    expect(defaultProps.onContentClick).toHaveBeenCalled();
  });

  it('calls onEmojiSelect when emoji is selected', () => {
    render(<EmojiPickerModal {...defaultProps} />);

    const selectButton = screen.getByText('Select Emoji');
    fireEvent.click(selectButton);

    expect(defaultProps.onEmojiSelect).toHaveBeenCalledWith({ native: '😀' });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<EmojiPickerModal {...defaultProps} />);

    const modal = container.querySelector('[class*="fixed"]');
    expect(modal).toHaveClass('fixed', 'inset-0', 'flex', 'items-center', 'justify-center');

    const content = container.querySelector('[class*="bg-background"]');
    expect(content).toHaveClass('bg-background', 'rounded-lg', 'shadow-2xl');
  });
});
