import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostTagAddButton } from './PostTagAddButton';

// Mock @/libs with partial mock
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Plus: ({ className, strokeWidth }: { className?: string; strokeWidth?: number }) => (
      <div data-testid="plus-icon" className={className} data-stroke-width={strokeWidth}>
        Plus
      </div>
    ),
  };
});

describe('PostTagAddButton', () => {
  it('renders button with plus icon', () => {
    render(<PostTagAddButton />);

    const button = screen.getByRole('button');
    const icon = screen.getByTestId('plus-icon');

    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const mockOnClick = vi.fn();
    render(<PostTagAddButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label', () => {
    render(<PostTagAddButton />);

    const button = screen.getByLabelText('Add new tag');
    expect(button).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<PostTagAddButton disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const mockOnClick = vi.fn();
    render(<PostTagAddButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

describe('PostTagAddButton - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<PostTagAddButton />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
