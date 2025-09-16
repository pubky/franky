import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea>Default Textarea</Textarea>);
    const textarea = screen.getByText('Default Textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Textarea disabled data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
  });

  it('handles updating value', () => {
    const { rerender } = render(<Textarea value="Initial value" onChange={() => {}} data-testid="textarea" />);
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial value');

    rerender(<Textarea value="Updated value" onChange={() => {}} data-testid="textarea" />);
    expect(textarea.value).toBe('Updated value');
  });
});

describe('Textarea - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<Textarea />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different configurations', () => {
    const { container: defaultContainer } = render(<Textarea />);
    expect(defaultContainer.firstChild).toMatchSnapshot();

    const { container: customClassContainer } = render(<Textarea className="custom-textarea" />);
    expect(customClassContainer.firstChild).toMatchSnapshot();

    const { container: placeholderContainer } = render(<Textarea placeholder="Enter text" />);
    expect(placeholderContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different states', () => {
    const { container: disabledContainer } = render(<Textarea disabled />);
    expect(disabledContainer.firstChild).toMatchSnapshot();

    const { container: invalidContainer } = render(<Textarea aria-invalid />);
    expect(invalidContainer.firstChild).toMatchSnapshot();

    const { container: readonlyContainer } = render(<Textarea readOnly />);
    expect(readonlyContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for different props', () => {
    const { container: withValueContainer } = render(<Textarea value="Initial value" onChange={() => {}} />);
    expect(withValueContainer.firstChild).toMatchSnapshot();

    const { container: withDefaultValueContainer } = render(<Textarea defaultValue="Default text" />);
    expect(withDefaultValueContainer.firstChild).toMatchSnapshot();

    const { container: withRowsContainer } = render(<Textarea rows={5} />);
    expect(withRowsContainer.firstChild).toMatchSnapshot();

    const { container: withResizeContainer } = render(<Textarea className="resize-none" />);
    expect(withResizeContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshots for additional props', () => {
    const { container: withIdContainer } = render(<Textarea id="textarea-id" />);
    expect(withIdContainer.firstChild).toMatchSnapshot();

    const { container: withDataTestIdContainer } = render(<Textarea data-testid="custom-textarea" />);
    expect(withDataTestIdContainer.firstChild).toMatchSnapshot();

    const { container: withNameContainer } = render(<Textarea name="textarea-name" />);
    expect(withNameContainer.firstChild).toMatchSnapshot();
  });
});
