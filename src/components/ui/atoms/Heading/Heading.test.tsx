import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders with default props', () => {
    render(<Heading>Default Heading</Heading>);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-foreground');
    expect(heading).toHaveTextContent('Default Heading');
  });

  it('renders different heading levels', () => {
    const { rerender } = render(<Heading level={2}>H2 Heading</Heading>);
    let heading = screen.getByRole('heading', { level: 2 });
    expect(heading.tagName).toBe('H2');

    rerender(<Heading level={3}>H3 Heading</Heading>);
    heading = screen.getByRole('heading', { level: 3 });
    expect(heading.tagName).toBe('H3');

    rerender(<Heading level={6}>H6 Heading</Heading>);
    heading = screen.getByRole('heading', { level: 6 });
    expect(heading.tagName).toBe('H6');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Heading size="sm">Small Heading</Heading>);
    let heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-lg', 'font-semibold');

    rerender(<Heading size="lg">Large Heading</Heading>);
    heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-2xl', 'font-bold');

    rerender(<Heading size="xl">Extra Large Heading</Heading>);
    heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-4xl', 'font-bold');

    rerender(<Heading size="2xl">2XL Heading</Heading>);
    heading = screen.getByRole('heading');
    expect(heading).toHaveClass('text-6xl', 'sm:text-9xl', 'font-bold');
  });

  it('combines level and size props correctly', () => {
    render(
      <Heading level={3} size="2xl">
        H3 2XL
      </Heading>,
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.tagName).toBe('H3');
    expect(heading).toHaveClass('text-6xl', 'sm:text-9xl', 'font-bold');
  });

  it('applies custom className', () => {
    render(<Heading className="custom-heading-class">Custom Heading</Heading>);

    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('custom-heading-class');
    expect(heading).toHaveClass('text-foreground'); // Should still have base classes
  });

  it('renders complex children correctly', () => {
    render(
      <Heading>
        <span>Part 1</span> and <strong>Part 2</strong>
      </Heading>,
    );

    const heading = screen.getByRole('heading');
    expect(screen.getByText('Part 1')).toBeInTheDocument();
    expect(screen.getByText('Part 2')).toBeInTheDocument();
    expect(heading).toHaveTextContent('Part 1 and Part 2');
  });
});
