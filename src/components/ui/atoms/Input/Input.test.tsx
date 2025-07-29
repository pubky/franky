import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).toHaveClass(
      'file:text-foreground',
      'placeholder:text-muted-foreground',
      'selection:bg-primary',
      'selection:text-primary-foreground',
      'dark:bg-input/30',
      'border-input',
      'flex',
      'h-9',
      'w-full',
      'min-w-0',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-base',
      'shadow-xs',
      'transition-[color,box-shadow]',
      'outline-none',
    );
  });

  it('applies custom className', () => {
    render(<Input data-testid="input" className="custom-class" />);
    const input = screen.getByTestId('input');

    expect(input).toHaveClass('custom-class');
  });

  it('accepts and displays value', () => {
    render(<Input data-testid="input" value="test value" onChange={() => {}} />);
    const input = screen.getByTestId('input') as HTMLInputElement;

    expect(input.value).toBe('test value');
  });

  it('accepts placeholder text', () => {
    render(<Input data-testid="input" placeholder="Enter text here" />);
    const input = screen.getByTestId('input');

    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input data-testid="input" type="text" />);
    let input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'text');

    rerender(<Input data-testid="input" type="password" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input data-testid="input" type="email" />);
    input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles disabled state', () => {
    render(<Input data-testid="input" disabled />);
    const input = screen.getByTestId('input');

    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('handles readonly state', () => {
    render(<Input data-testid="input" readOnly />);
    const input = screen.getByTestId('input');

    expect(input).toHaveAttribute('readonly');
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<Input data-testid="input" onClick={handleClick} />);
    const input = screen.getByTestId('input');

    fireEvent.click(input);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Input data-testid="input" onChange={handleChange} />);
    const input = screen.getByTestId('input');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles onFocus and onBlur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input data-testid="input" onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByTestId('input');

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} data-testid="input" />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('applies aria-invalid styling', () => {
    render(<Input data-testid="input" aria-invalid />);
    const input = screen.getByTestId('input');

    expect(input).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'dark:aria-invalid:ring-destructive/40',
      'aria-invalid:border-destructive',
    );
  });

  it('handles file input styling', () => {
    render(<Input data-testid="input" type="file" />);
    const input = screen.getByTestId('input');

    expect(input).toHaveClass(
      'file:inline-flex',
      'file:h-7',
      'file:border-0',
      'file:bg-transparent',
      'file:text-sm',
      'file:font-medium',
    );
  });

  it('supports all standard input attributes', () => {
    render(
      <Input
        data-testid="input"
        id="test-input"
        name="testName"
        required
        maxLength={100}
        minLength={5}
        pattern="[a-z]+"
        autoComplete="off"
      />,
    );
    const input = screen.getByTestId('input');

    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'testName');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('maxLength', '100');
    expect(input).toHaveAttribute('minLength', '5');
    expect(input).toHaveAttribute('pattern', '[a-z]+');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });
});
