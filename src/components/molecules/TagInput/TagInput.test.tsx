import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from './TagInput';

// Use real hooks, only mock useEmojiInsert
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>();
  return {
    ...actual,
    useEmojiInsert: vi.fn(() => vi.fn()),
  };
});

vi.mock('@/molecules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/molecules')>();
  return {
    ...actual,
    EmojiPickerDialog: ({ open }: { open: boolean }) => (open ? <div data-testid="emoji-picker" /> : null),
  };
});

const mockOnTagAdd = vi.fn<(tag: string) => void>();

describe('TagInput', () => {
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

  it('converts uppercase input to lowercase', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'BITCOIN' } });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe('bitcoin');

    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockOnTagAdd).toHaveBeenCalledWith('bitcoin');
  });
});

describe('TagInput - Banned Character Sanitization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('strips colons from typed input', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello:world' } });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe('helloworld');
  });

  it('strips commas from typed input', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello,world' } });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe('helloworld');
  });

  it('strips spaces from typed input', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello world' } });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe('helloworld');
  });

  it('strips multiple banned characters from typed input', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello: world, test' } });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.value).toBe('helloworldtest');
  });

  it('submits sanitized tag without banned characters', async () => {
    render(<TagInput onTagAdd={mockOnTagAdd} />);
    const input = screen.getByPlaceholderText('add tag') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'bit:coin' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockOnTagAdd).toHaveBeenCalledWith('bitcoin');
  });
});

describe('TagInput - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    const { container } = render(<TagInput onTagAdd={mockOnTagAdd} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
