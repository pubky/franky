import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from './List';

describe('List', () => {
  it('renders with default props (unordered list)', () => {
    render(<List elements={['Item 1', 'Item 2', 'Item 3']} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('UL');
    expect(list).toHaveClass('list-disc', 'ml-6', 'text-lg', 'text-muted-foreground', 'font-normal');
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders ordered list correctly', () => {
    render(<List type="ol" elements={['First', 'Second', 'Third']} />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveClass('list-decimal', 'ml-6', 'text-lg', 'text-muted-foreground', 'font-normal');
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('renders different list styles correctly', () => {
    const { rerender } = render(<List elements={['Item']} style="circle" />);
    let list = screen.getByRole('list');
    expect(list).toHaveClass('list-circle');

    rerender(<List elements={['Item']} style="square" />);
    list = screen.getByRole('list');
    expect(list).toHaveClass('list-square');

    rerender(<List type="ol" elements={['Item']} style="lower-alpha" />);
    list = screen.getByRole('list');
    expect(list).toHaveClass('list-lower-alpha');

    rerender(<List type="ol" elements={['Item']} style="upper-roman" />);
    list = screen.getByRole('list');
    expect(list).toHaveClass('list-upper-roman');
  });

  it('applies custom className', () => {
    render(<List elements={['Item']} className="custom-list-class" />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-list-class');
    expect(list).toHaveClass('list-disc'); // Should still have base classes
  });

  it('renders complex elements correctly', () => {
    const complexElements = [
      'Simple text',
      <span key="complex">
        Complex <strong>element</strong>
      </span>,
      'Another simple text',
    ];

    render(<List elements={complexElements} />);

    expect(screen.getByText('Simple text')).toBeInTheDocument();
    expect(screen.getByText('Complex')).toBeInTheDocument();
    expect(screen.getByText('element')).toBeInTheDocument();
    expect(screen.getByText('Another simple text')).toBeInTheDocument();
  });

  it('handles empty elements array', () => {
    render(<List elements={[]} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children).toHaveLength(0);
  });

  it('uses correct default styles based on type', () => {
    const { rerender } = render(<List elements={['Item']} />);
    let list = screen.getByRole('list');
    expect(list).toHaveClass('list-disc'); // Default for ul

    rerender(<List type="ol" elements={['Item']} />);
    list = screen.getByRole('list');
    expect(list).toHaveClass('list-decimal'); // Default for ol
  });

  it('overrides default style when style prop is provided', () => {
    render(<List type="ol" elements={['Item']} style="upper-alpha" />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('list-upper-alpha');
    expect(list).not.toHaveClass('list-decimal'); // Should not have default
  });
});
