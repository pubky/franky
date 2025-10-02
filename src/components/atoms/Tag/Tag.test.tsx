import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tag } from './Tag';
import * as Libs from '@/libs';

describe('Tag', () => {
  it('renders tag name correctly', () => {
    render(<Tag name="bitcoin" />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByTestId('tag-name')).toBeInTheDocument();
  });

  it('renders tag with count', () => {
    render(<Tag name="bitcoin" count={16} />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByTestId('tag-count')).toBeInTheDocument();
  });

  it('does not render count when not provided', () => {
    render(<Tag name="bitcoin" />);

    expect(screen.getByText('bitcoin')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-count')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<Tag name="bitcoin" onClick={mockOnClick} />);

    const tag = screen.getByTestId('tag');
    fireEvent.click(tag);

    expect(mockOnClick).toHaveBeenCalledWith('bitcoin');
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(<Tag name="bitcoin" className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  it('renders with custom data-testid', () => {
    render(<Tag name="bitcoin" data-testid="custom-tag" />);

    expect(screen.getByTestId('custom-tag')).toBeInTheDocument();
  });

  it('generates consistent colors for same tag name', () => {
    const { container: container1 } = render(<Tag name="bitcoin" />);
    const { container: container2 } = render(<Tag name="bitcoin" />);

    const style1 = container1.firstChild as HTMLElement;
    const style2 = container2.firstChild as HTMLElement;

    expect(style1.style.backgroundColor).toBe(style2.style.backgroundColor);
  });

  it('generates different colors for different tag names', () => {
    const { container: container1 } = render(<Tag name="bitcoin" />);
    const { container: container2 } = render(<Tag name="ethereum" />);

    const style1 = container1.firstChild as HTMLElement;
    const style2 = container2.firstChild as HTMLElement;

    expect(style1.style.backgroundColor).not.toBe(style2.style.backgroundColor);
  });

  it('uses custom color for known tags with opacity', () => {
    const { container } = render(<Tag name="bitcoin" />);
    const style = container.firstChild as HTMLElement;

    const expectedColor = Libs.hexToRgba(Libs.generateRandomColor('bitcoin'), 0.3);
    expect(style.style.backgroundColor).toBe(expectedColor);
  });

  it('uses custom color for pubky tag with opacity', () => {
    const { container } = render(<Tag name="pubky" />);
    const style = container.firstChild as HTMLElement;

    const expectedColor = Libs.hexToRgba(Libs.generateRandomColor('pubky'), 0.3);
    expect(style.style.backgroundColor).toBe(expectedColor);
  });

  it('has correct base styles', () => {
    const { container } = render(<Tag name="bitcoin" />);
    const tag = container.firstChild as HTMLElement;

    expect(tag).toHaveClass('w-fit');
    expect(tag).toHaveClass('flex');
    expect(tag).toHaveClass('items-center');
    expect(tag).toHaveClass('justify-between');
    expect(tag).toHaveClass('px-3');
    expect(tag).toHaveClass('h-8');
    expect(tag).toHaveClass('rounded-md');
    expect(tag).toHaveClass('cursor-pointer');
    expect(tag).toHaveClass('transition-all');
    expect(tag).toHaveClass('duration-200');
  });

  it('renders tag name with correct typography', () => {
    render(<Tag name="bitcoin" />);

    const tagName = screen.getByTestId('tag-name');
    expect(tagName).toHaveClass('text-sm');
    expect(tagName).toHaveClass('font-semibold');
    expect(tagName).toHaveClass('text-foreground');
  });

  it('renders count with correct typography', () => {
    render(<Tag name="bitcoin" count={16} />);

    const tagCount = screen.getByTestId('tag-count');
    expect(tagCount).toHaveClass('text-sm');
    expect(tagCount).toHaveClass('ml-1.5');
    expect(tagCount).toHaveClass('text-foreground/50');
    expect(tagCount).toHaveClass('font-medium');
  });

  it('handles zero count', () => {
    render(<Tag name="bitcoin" count={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('tag-count')).toBeInTheDocument();
  });

  it('handles large count numbers', () => {
    render(<Tag name="bitcoin" count={999999} />);

    expect(screen.getByText('999999')).toBeInTheDocument();
  });

  it('shows border when clicked prop is true', () => {
    const { container } = render(<Tag name="bitcoin" clicked={true} />);
    const tag = container.firstChild as HTMLElement;

    // Should have border when clicked
    const expectedBorderColor = Libs.hexToRgba(Libs.generateRandomColor('bitcoin'), 1);
    // Convert rgba to rgb for comparison (browser converts rgba(255,153,0,1) to rgb(255,153,0))
    const rgbColor = expectedBorderColor.replace('rgba', 'rgb').replace(', 1)', ')');
    expect(tag.style.border).toBe(`1px solid ${rgbColor}`);
  });

  it('does not show border when clicked prop is false', () => {
    const { container } = render(<Tag name="bitcoin" clicked={false} />);
    const tag = container.firstChild as HTMLElement;

    // Should have transparent border when not clicked
    expect(tag.style.border).toBe('1px solid transparent');
  });

  it('maintains background color regardless of clicked state', () => {
    const { container: container1 } = render(<Tag name="bitcoin" clicked={false} />);
    const { container: container2 } = render(<Tag name="bitcoin" clicked={true} />);

    const tag1 = container1.firstChild as HTMLElement;
    const tag2 = container2.firstChild as HTMLElement;

    // Both should have same background color
    const expectedColor = Libs.hexToRgba(Libs.generateRandomColor('bitcoin'), 0.3);
    expect(tag1.style.backgroundColor).toBe(expectedColor);
    expect(tag2.style.backgroundColor).toBe(expectedColor);
  });

  it('shows shadow on hover when not clicked', () => {
    const { container } = render(<Tag name="bitcoin" clicked={false} />);
    const tag = container.firstChild as HTMLElement;

    // Initial state - no shadow
    expect(tag.style.boxShadow).toBe('');

    // Hover the tag
    fireEvent.mouseEnter(tag);

    // Should show inset shadow
    const expectedShadowColor = Libs.hexToRgba(Libs.generateRandomColor('bitcoin'), 1);
    expect(tag.style.boxShadow).toBe(`inset 0 0 10px 2px ${expectedShadowColor}`);

    // Leave hover
    fireEvent.mouseLeave(tag);

    // Should remove shadow
    expect(tag.style.boxShadow).toBe('');
  });

  it('does not show shadow on hover when clicked', () => {
    const { container } = render(<Tag name="bitcoin" clicked={true} />);
    const tag = container.firstChild as HTMLElement;

    // Initial state - no shadow
    expect(tag.style.boxShadow).toBe('');

    // Hover the tag
    fireEvent.mouseEnter(tag);

    // Should not show shadow when clicked
    expect(tag.style.boxShadow).toBe('');

    // Leave hover
    fireEvent.mouseLeave(tag);

    // Should still not have shadow
    expect(tag.style.boxShadow).toBe('');
  });

  it('maintains border when clicked and hovered', () => {
    const { container } = render(<Tag name="bitcoin" clicked={true} />);
    const tag = container.firstChild as HTMLElement;

    // Should have border when clicked
    const expectedBorderColor = Libs.hexToRgba(Libs.generateRandomColor('bitcoin'), 1);
    // Convert rgba to rgb for comparison (browser converts rgba(255,153,0,1) to rgb(255,153,0))
    const rgbColor = expectedBorderColor.replace('rgba', 'rgb').replace(', 1)', ')');
    expect(tag.style.border).toBe(`1px solid ${rgbColor}`);

    // Hover and leave
    fireEvent.mouseEnter(tag);
    fireEvent.mouseLeave(tag);

    // Should still have border
    expect(tag.style.border).toBe(`1px solid ${rgbColor}`);
  });
});
