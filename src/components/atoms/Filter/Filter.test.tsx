import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterRoot, FilterHeader, FilterList, FilterItem, FilterItemIcon, FilterItemLabel } from './Filter';

const MockIcon = ({ className }: { className?: string }) => (
  <div data-testid="mock-icon" className={className}>
    Icon
  </div>
);

describe('Filter Components', () => {
  describe('FilterRoot', () => {
    it('renders with default props', () => {
      render(
        <FilterRoot>
          <div>Test content</div>
        </FilterRoot>,
      );

      const root = screen.getByTestId('filter-root');
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass('flex', 'flex-col', 'gap-4', 'bg-background');
    });

    it('applies custom className', () => {
      render(
        <FilterRoot className="custom-class">
          <div>Test content</div>
        </FilterRoot>,
      );

      const root = screen.getByTestId('filter-root');
      expect(root).toHaveClass('custom-class');
    });
  });

  describe('FilterHeader', () => {
    it('renders with title', () => {
      render(<FilterHeader title="Test Filter" />);

      expect(screen.getByText('Test Filter')).toBeInTheDocument();
      const heading = screen.getByText('Test Filter');
      expect(heading).toHaveClass('text-muted-foreground', 'font-light');
    });

    it('applies custom className', () => {
      render(<FilterHeader title="Test Filter" className="custom-header" />);

      const heading = screen.getByText('Test Filter');
      expect(heading).toHaveClass('custom-header');
    });
  });

  describe('FilterList', () => {
    it('renders with default props', () => {
      render(
        <FilterList>
          <div>Item 1</div>
          <div>Item 2</div>
        </FilterList>,
      );

      const list = screen.getByTestId('filter-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('flex', 'flex-col', 'gap-2');
    });

    it('applies custom className', () => {
      render(
        <FilterList className="custom-list">
          <div>Item 1</div>
        </FilterList>,
      );

      const list = screen.getByTestId('filter-list');
      expect(list).toHaveClass('custom-list');
    });
  });

  describe('FilterItem', () => {
    it('renders with default props', () => {
      render(
        <FilterItem>
          <span>Test Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toBeInTheDocument();
      expect(item).toHaveClass('cursor-pointer', 'flex', 'gap-2', 'text-base', 'font-medium');
      expect(item).toHaveAttribute('data-selected', 'false');
    });

    it('renders as selected', () => {
      render(
        <FilterItem isSelected={true}>
          <span>Selected Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toHaveClass('text-foreground');
      expect(item).toHaveAttribute('data-selected', 'true');
    });

    it('renders as unselected', () => {
      render(
        <FilterItem isSelected={false}>
          <span>Unselected Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toHaveClass('text-muted-foreground', 'hover:text-secondary-foreground');
      expect(item).toHaveAttribute('data-selected', 'false');
    });

    it('calls onClick when clicked', () => {
      const mockOnClick = vi.fn();
      render(
        <FilterItem onClick={mockOnClick}>
          <span>Clickable Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      fireEvent.click(item);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      render(
        <FilterItem className="custom-item">
          <span>Test Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('FilterItemIcon', () => {
    it('renders with icon', () => {
      render(<FilterItemIcon icon={MockIcon} />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-5', 'h-5');
    });

    it('applies custom className', () => {
      render(<FilterItemIcon icon={MockIcon} className="custom-icon" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toHaveClass('custom-icon');
    });
  });

  describe('FilterItemLabel', () => {
    it('renders with children', () => {
      render(<FilterItemLabel>Test Label</FilterItemLabel>);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<FilterItemLabel className="custom-label">Test Label</FilterItemLabel>);

      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('custom-label');
    });
  });
});
