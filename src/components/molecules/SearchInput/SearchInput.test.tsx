import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from './SearchInput';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Input: ({
    type,
    placeholder,
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    className,
  }: {
    type: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
  }) => (
    <input
      data-testid="search-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
    />
  ),
  Button: ({
    children,
    onClick,
    className,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    type?: 'submit' | 'reset' | 'button';
  }) => (
    <button data-testid="search-button" onClick={onClick} className={className} type={type}>
      {children}
    </button>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dropdown-card" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs
// Mock libs - use actual utility functions and icons from lucide-react
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return { ...actual };
});

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SearchInput />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const onChange = vi.fn();
    render(<SearchInput onChange={onChange} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('calls onSearch when Enter key is pressed', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('calls onSearch when search button is clicked', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('calls onSearch with current input value', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test value' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('test value');
  });

  it('handles focus and blur events', () => {
    render(<SearchInput />);

    const input = screen.getByTestId('search-input');

    // Without children, focus should not change the styling
    fireEvent.focus(input);
    expect(input).toHaveClass(
      'px-6 py-6 border-border rounded-full bg-gradient-to-b from-background via-background via-60% to-transparent',
    );

    fireEvent.blur(input);
    expect(input).toHaveClass(
      'px-6 py-6 border-border rounded-full bg-gradient-to-b from-background via-background via-60% to-transparent',
    );
  });

  it('changes styling when focused with children', () => {
    render(
      <SearchInput>
        <div data-testid="dropdown-content">Dropdown content</div>
      </SearchInput>,
    );

    const input = screen.getByTestId('search-input');

    // With children, focus should change the styling
    fireEvent.focus(input);
    expect(input).toHaveClass('px-6 py-6 border-border rounded-t-2xl rounded-b-none border-b-0 bg-transparent');

    fireEvent.blur(input);
    expect(input).toHaveClass(
      'px-6 py-6 border-border rounded-full bg-gradient-to-b from-background via-background via-60% to-transparent',
    );
  });

  it('shows dropdown card when focused and has children', () => {
    render(
      <SearchInput>
        <div data-testid="dropdown-content">Dropdown content</div>
      </SearchInput>,
    );

    const input = screen.getByTestId('search-input');
    fireEvent.focus(input);

    expect(screen.getByTestId('dropdown-card')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
  });

  it('hides dropdown card when not focused', () => {
    render(
      <SearchInput>
        <div data-testid="dropdown-content">Dropdown content</div>
      </SearchInput>,
    );

    const input = screen.getByTestId('search-input');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(screen.queryByTestId('dropdown-card')).not.toBeInTheDocument();
  });

  it('does not show dropdown card when no children provided', () => {
    render(<SearchInput />);

    const input = screen.getByTestId('search-input');
    fireEvent.focus(input);

    expect(screen.queryByTestId('dropdown-card')).not.toBeInTheDocument();
  });

  it('uses internal state and does not sync with external value changes', () => {
    const { rerender } = render(<SearchInput value="initial" />);

    expect(screen.getByTestId('search-input')).toHaveValue('initial');

    // The component uses internal state, so external value changes don't affect the input
    rerender(<SearchInput value="updated" />);
    expect(screen.getByTestId('search-input')).toHaveValue('initial');
  });

  it('calls onSearch with correct value after multiple input changes', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');

    fireEvent.change(input, { target: { value: 'first' } });
    fireEvent.change(input, { target: { value: 'second' } });
    fireEvent.change(input, { target: { value: 'final' } });

    const button = screen.getByTestId('search-button');
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('final');
  });

  it('handles Enter key with initial value prop', () => {
    const onSearch = vi.fn();
    render(<SearchInput value="initial value" onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('initial value');
  });

  it('updates internal state correctly when typing over initial value', () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    render(<SearchInput value="initial" onChange={onChange} onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');

    // Type something new
    fireEvent.change(input, { target: { value: 'updated value' } });

    expect(onChange).toHaveBeenCalledWith('updated value');

    // Search should use the updated internal value
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('updated value');
  });

  it('handles non-Enter key events without triggering search', () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByTestId('search-input');
    fireEvent.keyDown(input, { key: 'Tab' });
    fireEvent.keyDown(input, { key: 'Shift' });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('applies correct dropdown styling when children are present and focused', () => {
    render(
      <SearchInput>
        <div>Dropdown content</div>
      </SearchInput>,
    );

    const input = screen.getByTestId('search-input');
    fireEvent.focus(input);

    const dropdown = screen.getByTestId('dropdown-card');
    expect(dropdown.className).toContain(
      'p-6 absolute top-full left-0 right-0 z-50 bg-gradient-to-b from-background to-transparent backdrop-blur-[25px] border border-t-0 border-border shadow-lg rounded-b-lg rounded-t-none max-h-96 overflow-y-auto',
    );
  });

  it('maintains focus behavior when children change dynamically', () => {
    const { rerender } = render(<SearchInput />);

    const input = screen.getByTestId('search-input');
    fireEvent.focus(input);

    // No dropdown without children
    expect(screen.queryByTestId('dropdown-card')).not.toBeInTheDocument();

    // Add children and check dropdown appears
    rerender(
      <SearchInput>
        <div>New content</div>
      </SearchInput>,
    );

    // Input should still be focused and dropdown should appear
    expect(screen.getByTestId('dropdown-card')).toBeInTheDocument();
  });
});

describe('SearchInput - Snapshots', () => {
  it('matches snapshot for default SearchInput', () => {
    const { container } = render(<SearchInput />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SearchInput with custom placeholder', () => {
    const { container } = render(<SearchInput placeholder="Search users..." />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SearchInput with initial value', () => {
    const { container } = render(<SearchInput value="test query" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SearchInput with custom className', () => {
    const { container } = render(<SearchInput className="custom-search" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for SearchInput with dropdown children', () => {
    const { container } = render(
      <SearchInput>
        <div>Suggested results</div>
        <div>Recent searches</div>
      </SearchInput>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
