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
vi.mock('@/libs', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  Search: ({ className }: { className?: string }) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
}));

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SearchInput />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'Search');
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput placeholder="Custom placeholder" />);

    expect(screen.getByTestId('search-input')).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('renders with initial value', () => {
    render(<SearchInput value="initial value" />);

    expect(screen.getByTestId('search-input')).toHaveValue('initial value');
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
    expect(input).toHaveClass('px-6 py-6 border-border rounded-t-2xl rounded-b-none border-b-0 dark:bg-transparent');

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

  it('applies custom className', () => {
    render(<SearchInput className="custom-class" />);

    const container = screen.getByTestId('container');
    expect(container.className).toContain('custom-class');
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
});
