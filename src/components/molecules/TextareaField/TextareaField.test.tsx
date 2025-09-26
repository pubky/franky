import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextareaField } from './TextareaField';

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Textarea: ({
    className,
    value,
    onChange,
    placeholder,
    rows,
    disabled,
    readOnly,
    onClick,
    maxLength,
    ...props
  }: {
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    readOnly?: boolean;
    onClick?: () => void;
    maxLength?: number;
    [key: string]: unknown;
  }) => (
    <textarea
      data-testid="textarea"
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      onClick={onClick}
      maxLength={maxLength}
      {...props}
    />
  ),
  Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="typography" className={className}>
      {children}
    </div>
  ),
}));

describe('TextareaField', () => {
  it('renders with required value prop', () => {
    render(<TextareaField value="Test content" />);
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Test content');
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<TextareaField value="" onClick={handleClick} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.click(textarea);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles onChange events with new content', () => {
    const handleChange = vi.fn();
    render(<TextareaField value="" onChange={handleChange} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', () => {
    render(<TextareaField value="" disabled />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
  });
});

describe('TextareaField - Snapshots', () => {
  it('matches snapshot for default TextareaField', () => {
    const { container } = render(<TextareaField value="Default content" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with placeholder', () => {
    const { container } = render(<TextareaField value="" placeholder="Enter your message here..." />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with dashed variant', () => {
    const { container } = render(<TextareaField value="Dashed content" variant="dashed" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with success status', () => {
    const { container } = render(
      <TextareaField value="Success content" status="success" message="All good!" messageType="success" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with provided message', () => {
    const { container } = render(<TextareaField value="" message="Helper text" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with error status', () => {
    const { container } = render(
      <TextareaField value="Error content" status="error" message="Something went wrong" messageType="error" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for TextareaField with custom rows and maxLength', () => {
    const { container } = render(<TextareaField value="Custom content" rows={6} maxLength={100} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for disabled TextareaField', () => {
    const { container } = render(<TextareaField value="Disabled content" disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for readOnly TextareaField', () => {
    const { container } = render(<TextareaField value="ReadOnly content" readOnly />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
