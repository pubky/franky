import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatusPicker } from './StatusPicker';

describe('StatusPicker', () => {
  it('renders emoji and status correctly', () => {
    render(<StatusPicker emoji="🌴" status="Vacationing" />);

    expect(screen.getByText('🌴')).toBeInTheDocument();
    expect(screen.getByText('Vacationing')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<StatusPicker emoji="🌴" status="Vacationing" onClick={mockOnClick} />);

    const button = screen.getByText('Vacationing').closest('button');
    fireEvent.click(button!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders without onClick handler', () => {
    render(<StatusPicker emoji="🚀" status="Working" />);

    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<StatusPicker emoji="🌴" status="Vacationing" onClick={() => {}} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
