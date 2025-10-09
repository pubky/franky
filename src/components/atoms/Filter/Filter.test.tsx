import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterRoot, FilterHeader, FilterList, FilterItem, FilterItemIcon, FilterItemLabel } from './Filter';

const MockIcon = ({ className }: { className?: string }) => <svg data-testid="mock-icon" className={className} />;

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
      expect(root).toMatchSnapshot();
    });

    it('applies custom className', () => {
      render(
        <FilterRoot className="custom-class">
          <div>Test content</div>
        </FilterRoot>,
      );

      const root = screen.getByTestId('filter-root');
      expect(root).toMatchSnapshot();
    });
  });

  describe('FilterHeader', () => {
    it('renders with title', () => {
      render(<FilterHeader title="Test Filter" />);

      expect(screen.getByText('Test Filter')).toBeInTheDocument();
      const heading = screen.getByText('Test Filter');
      expect(heading).toMatchSnapshot();
    });

    it('applies custom className', () => {
      render(<FilterHeader title="Test Filter" className="custom-header" />);

      const heading = screen.getByText('Test Filter');
      expect(heading).toMatchSnapshot();
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
      expect(list).toMatchSnapshot();
    });

    it('applies custom className', () => {
      render(
        <FilterList className="custom-list">
          <div>Item 1</div>
        </FilterList>,
      );

      const list = screen.getByTestId('filter-list');
      expect(list).toMatchSnapshot();
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
      expect(item).toMatchSnapshot();
      expect(item).toHaveAttribute('data-selected', 'false');
    });

    it('renders as selected', () => {
      render(
        <FilterItem isSelected={true}>
          <span>Selected Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toMatchSnapshot();
      expect(item).toHaveAttribute('data-selected', 'true');
    });

    it('renders as unselected', () => {
      render(
        <FilterItem isSelected={false}>
          <span>Unselected Item</span>
        </FilterItem>,
      );

      const item = screen.getByTestId('filter-item');
      expect(item).toMatchSnapshot();
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
      expect(item).toMatchSnapshot();
    });
  });

  describe('FilterItemIcon', () => {
    it('renders with icon', () => {
      render(<FilterItemIcon icon={MockIcon} />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toMatchSnapshot();
    });

    it('applies custom className', () => {
      render(<FilterItemIcon icon={MockIcon} className="custom-icon" />);

      const icon = screen.getByTestId('mock-icon');
      expect(icon).toMatchSnapshot();
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
      expect(label).toMatchSnapshot();
    });
  });
});
