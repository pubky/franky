import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from './InputField';

// Mock UI components
vi.mock('@/components/ui', () => ({
  Input: ({
    type,
    className,
    value,
    placeholder,
    disabled,
    readOnly,
    onClick,
  }: {
    type?: string;
    className?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    onClick?: () => void;
  }) => (
    <input
      data-testid="input"
      type={type}
      className={className}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onClick={onClick}
    />
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
}));

describe('InputField', () => {
  it('renders with default props', () => {
    render(<InputField value="test value" />);

    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test value');
  });

  it('renders with placeholder', () => {
    render(<InputField value="" placeholder="Enter text here" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter text here');
  });

  it('handles disabled state', () => {
    render(<InputField value="test" disabled={true} />);

    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('handles readonly state', () => {
    render(<InputField value="test" readOnly={true} />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('readonly');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<InputField value="test" onClick={handleClick} />);

    const input = screen.getByTestId('input');
    fireEvent.click(input);

    expect(handleClick).toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const icon = <div data-testid="custom-icon">Icon</div>;
    render(<InputField value="test" icon={icon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders dashed variant correctly', () => {
    render(<InputField value="test" variant="dashed" />);

    const container = screen.getByTestId('input').parentElement;
    expect(container).toHaveClass(
      'flex-row',
      'items-center',
      'gap-3',
      'rounded-md',
      'border',
      'border-dashed',
      'border-brand',
      'bg-transparent',
      'pl-4.5',
    );
  });

  it('handles loading state', () => {
    const loadingIcon = <div data-testid="loading-icon">Loading</div>;
    render(<InputField value="test" loading={true} loadingIcon={loadingIcon} loadingText="Loading..." />);

    const input = screen.getByTestId('input');
    const icon = screen.getByTestId('loading-icon');

    expect(input).toHaveValue('Loading...');
    expect(input).toBeDisabled();
    expect(icon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InputField value="test" className="custom-input-field" />);

    const wrapper = screen.getByTestId('input').parentElement;
    expect(wrapper).toHaveClass('custom-input-field');
  });

  it('shows icon when not loading', () => {
    const icon = <div data-testid="normal-icon">Icon</div>;
    const loadingIcon = <div data-testid="loading-icon">Loading</div>;

    render(<InputField value="test" icon={icon} loadingIcon={loadingIcon} loading={false} />);

    expect(screen.getByTestId('normal-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-icon')).not.toBeInTheDocument();
  });
});
