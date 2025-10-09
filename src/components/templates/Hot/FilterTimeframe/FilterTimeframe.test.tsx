import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterTimeframe } from './FilterTimeframe';

describe('FilterTimeframe', () => {
  it('renders without crashing', () => {
    const { container } = render(<FilterTimeframe />);
    expect(container).toBeTruthy();
  });

  it('renders Timeframe header', () => {
    render(<FilterTimeframe />);
    expect(screen.getByText('Timeframe')).toBeInTheDocument();
  });

  it('renders all timeframe options', () => {
    render(<FilterTimeframe />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('calls onTabChange when an option is clicked', () => {
    const mockOnTabChange = vi.fn();
    render(<FilterTimeframe onTabChange={mockOnTabChange} />);

    fireEvent.click(screen.getByText('This Month'));
    expect(mockOnTabChange).toHaveBeenCalledWith('thisMonth');
  });

  it('matches snapshot', () => {
    const { container } = render(<FilterTimeframe />);
    expect(container).toMatchSnapshot();
  });
});
