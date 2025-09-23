import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders with default props', () => {
    render(<Toggle />);
    const toggle = screen.getByTestId('toggle-default');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-pressed', 'false');
  });

  it('renders with custom text', () => {
    render(<Toggle>Custom Text</Toggle>);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    render(<Toggle showText={false}>Custom Text</Toggle>);
    expect(screen.queryByText('Custom Text')).not.toBeInTheDocument();
  });

  it('renders without icon when showIcon is false', () => {
    render(<Toggle showIcon={false} />);
    const toggle = screen.getByTestId('toggle-default');
    const icon = toggle.querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
    render(<Toggle icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('handles pressed state', () => {
    render(<Toggle pressed />);
    const toggle = screen.getByTestId('toggle-default');
    expect(toggle).toHaveAttribute('data-pressed', 'true');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Toggle onClick={handleClick} />);
    const toggle = screen.getByTestId('toggle-default');
    fireEvent.click(toggle);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants', () => {
    render(<Toggle variant="outline" />);
    expect(screen.getByTestId('toggle-outline')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    render(<Toggle size="lg" />);
    const toggle = screen.getByTestId('toggle-default');
    expect(toggle).toHaveAttribute('data-size', 'lg');
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Toggle disabled />);
    const toggle = screen.getByTestId('toggle-default');
    expect(toggle).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Toggle ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
