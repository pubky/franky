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

  it('handles disabled state', () => {
    render(<InputField value="test" disabled={true} />);

    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<InputField value="test" onClick={handleClick} />);

    const input = screen.getByTestId('input');
    fireEvent.click(input);

    expect(handleClick).toHaveBeenCalled();
  });
});

describe('InputField - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<InputField value="test value" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with placeholder', () => {
    const { container } = render(<InputField value="" placeholder="Enter text here" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when disabled', () => {
    const { container } = render(<InputField value="test" disabled={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when readOnly', () => {
    const { container } = render(<InputField value="test" readOnly={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<InputField value="test" className="custom-input-field" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with dashed variant', () => {
    const { container } = render(<InputField value="test" variant="dashed" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with icon', () => {
    const icon = <div data-testid="custom-icon">Icon</div>;

    const { container } = render(<InputField value="test" icon={icon} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when loading', () => {
    const loadingIcon = <div data-testid="loading-icon">Loading</div>;

    const { container } = render(
      <InputField value="test" loading={true} loadingIcon={loadingIcon} loadingText="Loading..." />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when not loading with icon', () => {
    const icon = <div data-testid="custom-icon">Icon</div>;
    const loadingIcon = <div data-testid="loading-icon">Loading</div>;

    const { container } = render(<InputField value="test" icon={icon} loadingIcon={loadingIcon} loading={false} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
