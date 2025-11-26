import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';

// Mock // Mock hooks
vi.mock('@/hooks', () => ({
  useEnterSubmit: (isValid: () => boolean, onSubmit: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isValid()) {
      e.preventDefault();
      onSubmit();
    }
  },
}));

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    EmojiPickerDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="emoji-picker" /> : null),
  };
});

describe('TagInput', () => {
  const mockOnTagAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with placeholder', () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    expect(screen.getByPlaceholderText('add tag')).toBeInTheDocument();
  });

  it('renders emoji picker button', () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    expect(screen.getByLabelText('Open emoji picker')).toBeInTheDocument();
  });

  it('calls onTagAdd when Enter is pressed with valid tag', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'bitcoin' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockOnTagAdd).toHaveBeenCalledWith('bitcoin');
  });

  it('matches snapshot', () => {
    const { container } = render(<TagInput onTagAdd={mockOnTagAdd} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
