import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostTagInput } from './PostTagInput';

// Mock @/libs with partial mock
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

describe('PostTagInput', () => {
  it('calls onChange when input value changes', () => {
    const mockOnChange = vi.fn();
    render(<PostTagInput onChange={mockOnChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'bitcoin' } });

    expect(mockOnChange).toHaveBeenCalledWith('bitcoin');
  });

  it('calls onSubmit when Enter is pressed with value', () => {
    const mockOnSubmit = vi.fn();
    render(<PostTagInput value="bitcoin" onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('bitcoin');
  });

  it('does not call onSubmit when Enter is pressed with empty value', () => {
    const mockOnSubmit = vi.fn();
    render(<PostTagInput value="" onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace before submitting', () => {
    const mockOnSubmit = vi.fn();
    render(<PostTagInput value="  bitcoin  " onSubmit={mockOnSubmit} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSubmit).toHaveBeenCalledWith('bitcoin');
  });

  it('calls onEmojiClick when emoji button is clicked', () => {
    const mockOnEmojiClick = vi.fn();
    render(<PostTagInput showEmojiPicker onEmojiClick={mockOnEmojiClick} />);

    const emojiButton = screen.getByLabelText(/open emoji picker/i);
    fireEvent.click(emojiButton);

    expect(mockOnEmojiClick).toHaveBeenCalledTimes(1);
  });

  it('does not render emoji button when showEmojiPicker is false', () => {
    render(<PostTagInput showEmojiPicker={false} />);

    const emojiButton = screen.queryByLabelText(/open emoji picker/i);
    expect(emojiButton).not.toBeInTheDocument();
  });

  it('displays custom placeholder', () => {
    render(<PostTagInput placeholder="custom placeholder" />);

    const input = screen.getByPlaceholderText('custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<PostTagInput ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });
});

describe('PostTagInput - Snapshots', () => {
  it('matches snapshot with empty state', () => {
    const { container } = render(<PostTagInput />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with filled state', () => {
    const { container } = render(<PostTagInput value="bitcoin" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker', () => {
    const { container } = render(<PostTagInput showEmojiPicker />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with emoji picker and value', () => {
    const { container } = render(<PostTagInput value="bitcoin" showEmojiPicker />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
