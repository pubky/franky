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

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<TextareaField value="" onChange={handleChange} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders with placeholder', () => {
    render(<TextareaField value="" placeholder="Enter your message" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
  });

  it('applies custom className to container', () => {
    render(<TextareaField value="" className="custom-field" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('custom-field');
  });

  it('applies default variant styling', () => {
    render(<TextareaField value="" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass(
      'flex-1',
      'cursor-pointer',
      'w-full',
      'items-center',
      'flex-row',
      'border',
      'gap-0',
      'rounded-md',
      'font-medium',
    );
  });

  it('applies dashed variant styling', () => {
    render(<TextareaField value="" variant="dashed" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('border-dashed', '!bg-alpha-90/10');
  });

  it('applies success status styling', () => {
    render(<TextareaField value="" status="success" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('border-brand', 'text-brand');
  });

  it('applies error status styling', () => {
    render(<TextareaField value="" status="error" />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('border-red-500', 'text-red-500');

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles disabled state', () => {
    render(<TextareaField value="" disabled />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
  });

  it('handles readOnly state', () => {
    render(<TextareaField value="" readOnly />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<TextareaField value="" onClick={handleClick} />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.click(textarea);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sets custom rows', () => {
    render(<TextareaField value="" rows={6} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('sets default rows to 4', () => {
    render(<TextareaField value="" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('handles maxLength prop', () => {
    render(<TextareaField value="" maxLength={100} />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('renders message with default style', () => {
    render(<TextareaField value="" message="Helper text" />);

    const message = screen.getByTestId('typography');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Helper text');
    expect(message).toHaveClass('ml-1', 'text-muted-foreground');
  });

  it('renders message with error style', () => {
    render(<TextareaField value="" message="Error message" messageType="error" />);

    const message = screen.getByTestId('typography');
    expect(message).toHaveClass('ml-1', 'text-red-500');
  });

  it('renders message with success style', () => {
    render(<TextareaField value="" message="Success message" messageType="success" />);

    const message = screen.getByTestId('typography');
    expect(message).toHaveClass('ml-1', 'text-brand');
  });

  it('does not render message when not provided', () => {
    render(<TextareaField value="" />);

    expect(screen.queryByTestId('typography')).not.toBeInTheDocument();
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
